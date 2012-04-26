# Jinn

Notifications center


## Features
* Notifications API (only Chrome) + fallback to [layer](#layer) (IE7+, FF, Opera, Safari)
* Dynamic favicon + custom [shape](#shape) (FF, Chrome, Opera)
* Not need jQuery
* Small size 2.6KB (minified + gzipped)



```js
// Settings notifications
Jinn.scope('OS')
	.tpl('#JinnOSTpl') // if borwser not support Notifications API then this tpl
	.opt({
		  icon: './jinn-32x32.png' // default icon
		, delay: 3 // auto hide after 3sec
	})
;


// Favicon default properties
Jinn.bubble({
	  fps:		2	// frame per second
	, iconX:	0	// X offset
	, iconY:	0	// Y offset
	, iconW:	13	// width
	, iconH:	13	// height
});


// Create notify
var notify = Jinn.say({
	  icon: '...'
	, title: '...'
	, text: '...'
	, delay: 0
});


// Close notify
notify.cancel();


// Set bubble
Jinn.bubble(4);
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

	/* __ */

});
```
