/**
 * @param	{Window}	window
 * @param	{Document}	document
 * @param	{Jinn}	Jinn
 * @param	[undef]
 */
(function (window, document, Jinn, undef){
	'use strict';

	var
		F = function (){}, // dummy function

		_ricon = /\bicon\b/,
		_rdata = /^data/,

		_pid, // animation pid
		_oSrc, // original favicon

		_val = null,
		_img = new Image,
		_frame = 0,

	// Default options
		_opts = {
			  val:		_val
			, fps:		2
			, iconX:	0
			, iconY:	0
			, iconW:	13
			, iconH:	13
		},


		/**
		 * Degrees to radians
		 *
		 * @private
		 * @param	{Number}	deg
		 * @return	{Number}
		 */
		_rad = function (deg){
			return	Math.PI/180 * deg;
		},


		/**
		 * Each all link elements
		 *
		 * @private
		 * @param   {Function}  fn  callback, first argument link
		 * @return  {HTMLElement}
		 */
		_links = function (fn){
			var links = document.getElementsByTagName('link'), i = links.length;
			while( i-- ) if( _ricon.test(links[i].getAttribute('rel')) && fn(links[i]) === true ){
				return	links[i];
			}
		},


		/**
		 * Set new favicon
		 *
		 * @private
		 * @param	{String}	src
		 */
		_setIcon = function (src){
			api.init();

			_links(function (node){ node.parentNode.removeChild(node); });

			var link = document.createElement('link');
			link.rel = 'icon';
			link.type = 'image/png';
			link.href = src;
			document.getElementsByTagName('head')[0].appendChild(link);
		},

		_canvas = document.createElement('canvas'),
		_support = _canvas.getContext && !!~_canvas.toDataURL('image/png').indexOf('data:image/png'),


		/**
		 * Redraw bubble on favicon
		 *
		 * @private
		 * @public  {String}	val
		 */
		_redrawBubble = function (val){
			if( _support && (_img['src'] != _opts['src'] || _val != val) ){
				api.init();

				// Set canvas size
				_canvas.width =
				_canvas.height = 16;

				// Load favicon
				_img.src = _opts.src;
				_img.onload = function(){
					function _draw(){
						// Get canvas context
						var ctx = _canvas.getContext('2d');

						// Clear canvas
						ctx.clearRect(0, 0, 16, 16);

						// Drop favicon
						ctx.drawImage(_img, 0, 0, _img.width, _img.height, _opts.iconX, _opts.iconY, _opts.iconW, _opts.iconH);

						// Draw bubble shape
						_opts.shape(ctx, val, _frame, _opts);

						// Set new favicon
						_setIcon(_canvas.toDataURL());

						if( _opts.fps <= ++_frame ){
							_frame = 0;
						}
					}

					clearInterval(_pid);

					if( val === null || val === undef || !_opts.fps ){
						_frame	= 0;
					} else {
						_pid	= setInterval(_draw, ~~(1000/_opts.fps +.5))
					}

					if( val === null || val === undef ){
						_setIcon(_opts['src']);
					} else {
						_draw();
					}
				};

				// allow cross origin resource requests if the image is not a data:uri
				// as detailed here: https://github.com/mrdoob/three.js/issues/1305
				if( !_rdata.test(_img.src) ){
					_img.crossOrigin = 'anonymous';
				}
				else {
					_img.crossOrigin = null;
					_img.removeAttribute('crossOrigin');
				}

				if( _img.width ){
					// Favicon loaded
					_img.onload();
				}
			}
		}
	;


	/**
	 * Default bubble shape
	 *
	 * @param {CanvasContext} ctx
	 * @param {String} val
	 * @param {Number} frame
	 * @param {Object} opts
	 */
	_opts['shape'] = function (ctx, val, frame, opts){
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
		ctx.fillText(val, x, y);
		ctx.fillText(val, x, y);
	};


	var api = {

		/**
		 * Bubble initialization
		 * @private
		 */
		init: function (){
			api.init = F;
			api.ready = 1;

			var icon = _links(function (){ return true; });

			if( icon ){
				_oSrc = icon.href;
				api['opt']('src', _opts.src || _oSrc);
			}
		},


		/**
		 * Set favicon src
		 *
		 * @public
		 * @param {String} src
		 */
		'src': function (src){
			return	api['opt']('src', src);
		},


		/**
		 * Set shape-function for bubble
		 *
		 * @public
		 * @param {Function} fn
		 */
		'shape': function (fn){
			api['opt']('shape', fn);
			return	this;
		},


		/**
		 * Set/get options
		 *
		 * @public
		 * @param  {*}	key   option name OR object of options
		 * @param  {*}  [val]
		 * @return {*}
		 */
		'opt': function (key, val){
			var redraw = api.ready || _opts['val'] || key == 'shape', emit;

			if( typeof key == 'string' ){
				if( val === undef ) return _opts[key];
				_opts[key] = val;
			}
			else {
				for( var k in key ){
					//noinspection JSUnfilteredForInLoop
					_opts[k] = key[k];
					redraw = redraw || k == 'shape';
				}
			}

			val = _opts['val'];

			if( redraw ){
				_redrawBubble(val);
			}

			if( val !== _val ){
				Jinn['emit']('bubble:val', val);
			}

			// Save previous value
			_val = val;
		},


		/**
		 * Set buuble value
		 *
		 * @public
		 * @param	{String}	val
		 */
		'set': function (val){
			api.init();
			api['opt']('val', val);
		},


		/**
		 * Revert original favicon
		 * @public
		 */
		'revert': function (){
			api['opt']('src', _oSrc);
		},


		/**
		 * Reset favicon
		 * revert original favicon
		 * @public
		 */
		'reset': function (){
			api['opt']({ 'src': _oSrc, 'val': null });
		},


		/**
		 * Clear favicon (remove bubble)
		 * @public
		 */
		'clear': function (){
			api['opt']('val', null);
		}
	};


	// low-level access
	Jinn['OS']['Bubble'] = api;


	/**
	 * Bubble interface
	 *
	 * @param {*}  name
	 * @param {*}  [val]
	 * @return {Jinn}
	 */
	Jinn.scope('OS')['bubble'] = function (name, val){
		var ret = this;

		if( typeof name == 'object' && name !== null ){
			// Set options
			api['opt'](name);
		}
		else if( name in api ){
			// Call method
			api[name](val);
		}
		else {
			// Set bubble value
			api.set(name);
		}

		return	ret;
	};


	Jinn['on']('bubble:val', function (val){
		api.set(val);
	});
})(window, document, Jinn);
