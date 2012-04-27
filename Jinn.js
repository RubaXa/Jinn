/**
 * @build	Jinn, Jinn.OS, Jinn.bubble
 *
 * @param	{Window}	window
 * @param	{Document}	document
 * @param	[undef]
 *
 * @example
 * 	Jinn
 * 		.bubble(10)
 * 		.say({ icon: '..', title: '...', text: '...' })
 * 		.scope('menu')
 * 			.bubble(5)
 * 			.say({ ... })
 * 	;
 */
(function (window, document, undef){
	'use strict';

	var
		  F = function (){} // dymmy function
		, api = function (api){ this._api = api; } // interface class
		, addEventListener = 'addEventListener'

		, _agent	= navigator.userAgent.toLowerCase()

		, _opts		= { scope: 'OS' }
		, _scope	= {}
		, _listeners = {}

		, _prefix	= '__jinn.'
		, _eprefix	= '__event.'

		, _pid
		, _lock
		, _emit		= function (){
						if( !_lock ){
							_lock = 1;
							clearTimeout(_pid);
							_pid = setTimeout(__emit, 10);
						}
					}

		, __emit	= function (){
						var name, val, i;

						for( name in _listeners ){
							val = Jinn['store'](_eprefix + name);

							for( i = _listeners[name].length; i--; ){
								_listeners[name][i](val);
							}
						}

						_lock = 0;
					}
	;


	/**
	 * Extend class
	 *
	 * @public
	 * @param {Object} methods
	 * @return {Function}
	 */
	api['ext'] = function (methods){
		var New = function (){ this['__lego'].apply(this, arguments); }, name;

		F.prototype = this['fn'];
		New.prototype = New['fn'] = new F;

		New['ext'] = api['ext'];
		New['methods'] = api['methods'];

		for( name in methods ){
			New['fn'][name] = methods[name];
		}

		return	New;
	};



	/**
	 * Set methods
	 *
	 * @public
	 * @param {Object} methods
	 * @return {api}
	 */
	api['methods'] = function (methods){
		for( var key in methods ){
			this['fn'][key] = methods[key];
		}
		return	this;
	};


	api.prototype = api['fn'] = {
		'ALLOWED': 0,
		'NOT_ALLOWED': 1,
		'DENIED': 2,

		'_opts': {},


		/**
		 * Lego
		 * @constructor
		 */
		'__lego': F,


		/**
		 * Check permissions
		 *
		 * @protected
		 * @return {Number}
		 */
		'_check': function (){
			return this['ALLOWED'];
		},


		/**
		 * Request permissions
		 *
		 * @protected
		 * @param {Function} fn
		 */
		'_request': function (fn){
			fn();
		},


		/**
		 * Extend options
		 *
		 * @protected
		 * @param {String} obj
		 * @return {*}
		 */
		'_ext': function (obj){
			for( var key in this['_opts'] ) if( obj[key] === undef ) obj[key] = this['_opts'][key];
			return	obj;
		},


		/**
		 * Set options
		 *
		 * @public
		 * @param {Object|String} key
		 * @param {*} [val]
		 * @return {*}
		 */
		'opt': function (key, val){
			var ret = this;
			if( val !== undef ){
				ret['_opts'][key] = val;
			}
			else if( typeof key == 'object' ){
				for( val in key ) ret['_opts'][val] = key[val];
			}
			else {
				ret	= ret['_opts'][key];
			}

			return	ret;
		},


		/**
		 * Check/request permissions
		 *
		 * @public
		 * @param {Function} [fn]
		 * @return {Number}
		 */
		'access': function (fn){
			if( fn ){
				if( !fn.j ){
					var _this = this;
					fn.j = function (){ fn.call(_this); };
				}
				this['hasRight']() ? fn.j() : this['_request'](fn.j);
			} else {
				return this['_check']();
			}
		},


		/**
		 * Has right
		 *
		 * @return {Boolean}
		 */
		'hasRight': function (){
			return this['access']() == this['ALLOWED'];
		},


		'add': F,
		'say': function (){ return this.add.apply(this, arguments) },

		'bubble': function (){},

		'end': function (){ return Jinn; }
	};


	var Jinn = {
		'API': api,

		/**
		 * Set/get option
		 *
		 * @public
		 * @param {String} name
		 * @param {*} [val]
		 * @return {*}
		 */
		'opt': function (name, val){
			if( val === undef ) return _opts[name];
			_opts[name] = val;
			return	Jinn;
		},


		/**
		 * Bind event listener
		 *
		 * @public
		 * @param {String} name
		 * @param {Function} fn
		 * @return {Jinn}
		 */
		'on': function (name, fn){
			if( !_listeners[name] ) _listeners[name] = [];
			_listeners[name].push(fn);
			return	Jinn;
		},


		/**
		 * Unind event listener
		 *
		 * @public
		 * @param {String}name
		 * @param {Function} fn
		 * @return {Jinn}
		 */
		'off': function (name, fn){
			if( name in _listeners ){
				var list = _listeners[name], i = list.length
				for( ; i--; ){
					if( list[i] === fn ){
						list.splice(i, 1);
						break;
					}
				}
			}
			return	Jinn;
		},


		/**
		 * Emit event
		 *
		 * @public
		 * @param {String} name
		 * @param {*} val
		 */
		'emit': function (name, val){
			Jinn['store'](_eprefix + name, val);
			_emit();
		},


		/**
		 * Set/get scope
		 *
		 * @param {String} name
		 * @param {api|Object} [scope]
		 * @return {*}
		 */
		'scope': function (name, scope){
			var ret = Jinn;

			if( name == undef ){
				ret	= Jinn.scope(_opts['scope']);
			}
			else if( scope !== undef ){
				_scope[name] = scope;
			}
			else if( name in _scope ){
				ret	= _scope[name];
			}
			else {
				throw 'Jinn: scope "'+name+'" is undefined';
			}

			return	ret;
		},


		/**
		 * Add event listener
		 *
		 * @param	{HTMLElement}  node
		 * @param	{Function} fn
		 */
		addEvent: function (node, name, fn){
			if( node ){
				var on = node[addEventListener] ? '' : 'on';
				node[on ? 'attachEvent' : addEventListener](on + name, fn, false);
			}

			return	Jinn;
		}

	}, _jinn = 'bubble access add say'.split(' '), i = _jinn.length;



	// Define short methods
	while( i-- ) (function (name){
		Jinn[name] = function (){
			var scope = Jinn.scope();
			return	scope[name].apply(scope, arguments);
		};
	})(_jinn[i]);



	/**
	 * Get/set stored value
	 *
	 * @param {String} key
	 * @param {String|Number} [val]
	 * @return {*}
	 */
	Jinn['store'] = function (key, val){
		var ret = Jinn, store = Jinn.scope('__store');

		if( val === null ){
			store.remove(_prefix + key);
		}
		else if( val === undef ){
			ret	= store['get'](_prefix + key);
		} else {
			store['set'](_prefix + key, val);
		}

		return	ret;
	};



	// Jinn storage
	(function (store, o){
		Jinn.scope('__store', {
			'get': function (key){
				return store ? store.getItem(key) : o[key];
			},

			'set': function (key, val){
				store ? store.setItem(key, val) : o[key] = val;
			},

			'remove': function (key){
				delete o[key];
				if( store ) store.removeItem(key);
			}
		});
	})(window.localStorage, {});



	// Detect browser
	Jinn[(
		   _agent.match(/webkit/i)
		|| _agent.match(/opera/i)
		|| _agent.match(/msie/i)
		|| _agent.indexOf('compatible') < 0 && _agent.match(/mozilla/i)
		|| []
	)[0]] = true;


	/** @namespace Jinn.webkit */
	if( Jinn.webkit ){
		// Detail detect
		Jinn[(_agent.match(/chrome/i) || _agent.match(/safari/i) || [])[0]] = true;
	}


	Jinn.addEvent(window, 'storage', _emit);

	// @export
	window['Jinn'] = Jinn;
})(window, document);
