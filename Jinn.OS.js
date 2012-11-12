/**
 * @param	{Window}	window
 * @param	{Document}	document
 * @param	{Jinn}		Jinn
 * @param	{Notifications} Notifications
 * @param	[undef]
 *
 */
(function (window, document, Jinn, Notifications, undef){
	'use strict';

	var api = Jinn['API']['ext']({
		'_tpl': '#JinnOSTpl',

		'_opts': { 'title': '', 'text': '', 'delay': 60 },

		'tpl': function (tpl){
			this['_tpl'] = tpl;
			return	this;
		},

		'add': function (notify){
			if( typeof notify == 'string' ){
				notify = { title: notify };
			}

			this['_ext'](notify);

			var Notify = this['_create'](notify);

			Notify.show();

			if( notify['delay'] ){
				setTimeout(function (){ Notify.cancel(); }, notify['delay'] * 1000);
			}

			return	Notify;
		}
	});


	if( Notifications ){
		api['methods']({
			'_check': function (){
				return Notifications.checkPermission();
			},

			'_request': function (fn){
				Notifications.requestPermission(fn);
			},

			'_create': function (notify){
				try {
					var notify = Notifications.createNotification(notify['icon'], notify['title'], notify['text'])
				} catch (err){
					throw "Notifications.createNotification — access denied";
				}
				return	notify;
			}
		});
	}
	else {
		var
			_pad = 5,
			_rvar = /\{\{(.*?)\}\}/g,
			_queue = [],

			Notify = function (tpl, notify){
				if( /^#/.test(tpl) ){
					tpl = document.getElementById(tpl.substr(1));
					if( tpl ){
						tpl	= tpl.innerHTML;
					}
				}

				if( tpl ){
					this.el = document.createElement('div');
					this.el.innerHTML = tpl.replace(_rvar, function (a, key){
						return	(new Function('notify,v,u', 'try{v='+key+'}catch(e){} return v===u?"":v'))(notify);
					});

					document.body.appendChild(this.el);
				}
			}
		;


		Notify.redraw = function (){
			for( var y = _pad, i = 0, n = _queue.length; i < n; i++ ){
				_queue[i].el.style.top = y + 'px';
				y += _queue[i].el.offsetHeight + _pad
			}
		};


		Notify.prototype = {

			'show': function (){
				if( this.el ){
					var _this = this, style = _this.el.style;

					_queue.push(_this);

					style.right	= '5px';
					style.position	= 'fixed';
					style.display	= 'block';

					Notify.redraw();
					_this.el.onclick = function (){
						_this['onclick'].call(_this, { type: 'click', target: _this, currentTarget: _this });
					};
				}
			},

			'cancel': function (){
				if( this.el ){
					for( var i = 0, n = _queue.length; i < n; i++ ) if( _queue[i] === this ){
						_queue.splice(i, 1);
						Notify.redraw();
					}

					this.el.onclick = null;
					this.el.parentNode.removeChild(this.el);
					this.el = null;
				}
			},

			'onclick': function (){}
		};


		api['methods']({
			'hasRight': function (){
				return	!!this['_tpl'];
			},

			'_create': function (notify){
				return	new Notify(this['_tpl'], notify);
			}
		});
	}


	// @export
	Jinn.scope('OS', new (Jinn['OS'] = api));
})(window, document, Jinn, window.webkitNotifications);
