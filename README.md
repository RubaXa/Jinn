![Jinn Logo](https://github.com/RubaXa/Jinn/raw/master/jinn-32x32.png)


## Features
* Notifications API (only Chrome) + fallback to [layer](#layer) (IE7+, FF, Opera, Safari)
* Dynamic [favicon](#favicon) + custom [shape](#shape) (FF, Chrome, Opera)
* [LocalStorage](#LocalStorage) (IE8+, FF, Chrome, Safari, Opera 11.6+)
* Small size 2.6KB (minified + gzipped)
* High level [extensibility](#extensibility)
* No jQuery
* See [example](http://rubaxa.org/?Jinn)



```js
// Settings notifications
Jinn.scope('OS')
	.tpl('#JinnOSTpl') // if borwser not support Notifications API then this tpl
	.opt({
		  icon: './jinn-32x32.png' // default icon
		, delay: 3 // auto hide after 3sec
	})
;


// Disable notifications fallback
Jinn.scope('OS').tpl(null);


// Create notify
var notify = Jinn.say({
	  icon: '...'
	, title: '...'
	, text: '...'
	, delay: 0
});


// Close notify
notify.cancel();


// Short
Jinn.say('...'); // equal Jinn.say({ title: '...' });
```


<a name="layer"></a>
## Jinn layer template
```html
<script id="JinnOSTpl" type="text/x-jinn-tpl">
	<div class="jinn">
		<table width="100%" height="100%">
			<tr>
				<td class="jinn__icon"><img src="{{notify.icon}}"/></td>
				<td>
					<div class="jinn__title">{{notify.title.toUpperCase()}}</div>
					<div class="jinn__text">{{notify.text}}</div>
				</td>
			</tr>
		</table>
	</div>
</script>
```


<a name="favicon"></a>
## Favicon
```js
// Favicon default properties
Jinn.bubble({
	  fps:		2	// frame per second
	, src:		'...'	// favicon src OR DataURI
	, iconX:	0	// X offset
	, iconY:	0	// Y offset
	, iconW:	13	// width
	, iconH:	13	// height
});


// Set favicon image
Jinn.bubble('src', '...');


// Set bubble
Jinn.bubble(4);


// Revert original favicon
Jinn.bubble('revert');


// Revert + remove shape
Jinn.bubble('reset');
```


<a name="shape"></a>
## Favicon bubble shape
```js
/**
 * @param	{CanvasContext}		ctx
 * @param	{Mixed}				val
 * @param	{Number}			frame
 * @param	{Object}			options
 */
Jinn.bubble('shape', function (ctx, val, frame, options){
	var x = 15.5, y = 15;

	val			= val > 99 ? (x+=.5, '99+') : val;
	ctx.font	= (Jinn.webkit ? 'bold ' : '') + '9px arial';

	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur    = 2;
	ctx.shadowColor   = 'rgba(0,0,0,.5)';

	ctx.fillStyle = frame ? '#fc3' : '#fff';
	ctx.textAlign = 'right';

	ctx.fillText(val, x, y);
});
```


<a name="LocalStorage"></a>
## LocalStorage
```js
// Set localStorage
Jinn.store('key'/**String*/, 'val'/**String*/)

// Get
Jinn.store('key')/**String*/

// Remove
Jinn.store('key', null);
```


<a name="extensibility"></a>
## High leve extensibility
```js
var MenuScope = Jinn.API.ext({

	// Check permissions
	_check: function (){
		return this._perm;
	},


	// Request permissions
	_request: function (fn/**Function*/){
		// Your logic
		this._perm = 5;
		fn();
	},


	// Extend options
	_ext: function (obj/**Object*/){ },


	// Get/Set options
	opt: function (key/**String|Object*/, val/**[Mixed*/){ },


	// Check/request permissions
	access: function (fn/**Function*/){ },


	//
	hasRight: function (){
		return this.access() >= 5 && this.el;
	},

	// Add notify
	add: function (notify){
		/* ... */
	},

	__lego: function (id){
		this.el = document.getElementById(id.substr(1));
	},

	bubble: function (name, num){
		if( arguments.length == 1 ){
			num	= name;
			name = false;
		}

		var bubble = this.el.querySelector(name ? '.js-'+name+'-bubble' : '.js-bubble');
		if( bubble ){
			bubble.innerHTML = num;
			bubble.style.display = num > 0 ? '' : 'none';
		}
	}
});


// User scope
var UserScope = MenuScope.ext({
	hasRight: function (){ return true; })
});


// Add scope
Jinn
	.scope('menu', new MenuScope('#Menu'))
	.scope('user-notify', new UserScope('#UserNotify'))
	.scope('user-notify')
		.bubble(7)
		.end()
	scope('menu')
		.access(function (){
			Jinn
				.scope('menu')
					.bubble('news', 5)
					.bubble('messages', 3)
					.end()
				.say('Hi!')
			;
		})
;
```


## Browser detect
```js
Jinn.webkit;
Jinn.chrome;
Jinn.safari;
Jinn.opera;
Jinn.msie;
Jinn.mozilla;
```
