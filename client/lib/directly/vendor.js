/* eslint-disable */
const executeVendorScript = ( baseUrl ) => {
	// The Directly library causes side effects on parsing — notably the iframe is
	// immediately added to the DOM and the widget will uncontrolllably open if you've
	// recently interacted with it. So it needs to be tucked away inside a function
	// for better control.
	//
	// PLEASE NOTE: There are a few minor customizations below to the standard Directly
	// code. These points are annotated with the original code commented out. If you
	// need to upgrade the Directly library, please take care that the new version
	// takes these changes into account.

	/*!
	 * Directly, Inc.
	 * Version: 0.137.19
	 */
	! function( t ) {
		function e( n ) {
			if ( i[ n ] ) {return i[ n ].exports;}
			const r = i[ n ] = {
				exports: {},
				id: n,
				loaded: ! 1
			};
			return t[ n ].call( r.exports, r, r.exports, e ), r.loaded = ! 0, r.exports;
		}
		const i = {};
		return e.m = t, e.c = i, e.p = '/assets/build/', e.h = '1fdf3732ed221ec303d5', e( 0 );
	}( [ function( t, e, i ) {
		function n( t ) {
			return t && t.__esModule ? t : {
				'default': t
			};
		}
		let r = i( 23 ),
			o = n( r );
		! function( t, e ) {
			let n = 'DirectlyRTM',
				r = function() {
					this.config = {
						id: void 0
					}, this.baseUrl = void 0, this.scrollPosition = 0, this.viewport = {
						initial: '',
						intended: 'initial-scale=1, maximum-scale=1'
					};
					try {
						this.initCommandQueue(), this.setBaseUrl(), this.setScrollPosition(), this.createIframe(), this.createStyles();
					} catch ( e ) {
						console.error( e.name + ': ' + e.message );
					} finally {
						t.addEventListener( 'message', this.processPostMessage.bind( this ) );
					}
				};
			r.prototype.createIframe = function() {
				if ( ! this.config.id ) {throw new Error( 'Configuration id not provided. Set the configuration id using the ' + n + "('config', { id: YOUR_ID }) command." );}
				this.wrapper = e.createElement( 'div' ), this.wrapper.className = 'directly-rtm is-hidden', this.iframe = e.createElement( 'iframe' ), this.iframe.frameBorder = 0, this.iframe.height = 0, this.iframe.width = 0, this.iframe.src = this.baseUrl + '/chat?cfgId=' + this.config.id, this.iframe.onload = this.onLoad.bind( this ), this.wrapper.appendChild( this.iframe ), e.body.appendChild( this.wrapper );
			}, r.prototype.createStyles = function() {
				let t = e.createElement( 'link' ),
					n = e.head || e.getElementsByTagName( 'head' )[ 0 ];
				t.type = 'text/css', t.rel = 'stylesheet', t.href = this.baseUrl + '/widgets/rtm/style.css?v=' + i.h, n.appendChild( t );
			}, r.prototype.postMessageCommands = {
				hide: function() {
					this.wrapper.classList.add( 'directly-rtm', 'is-hidden' ), this.iframe.height = 0, this.iframe.width = 0;
				},
				maximize: function() {
					this.wrapper.classList.contains( 'is-minimized' ) && ( this.wrapper.classList.remove( 'is-minimized' ), this.wrapper.classList.add( 'is-maximizing' ) ), this.wrapper.classList.remove( 'is-ask-form', 'is-hidden' ), this.wrapper.classList.add( 'directly-rtm' ), this.iframe.height = '', this.iframe.width = '', setTimeout( function() {
						this.wrapper.classList.remove( 'is-maximizing' );
					}.bind( this ), 110 ), this.utils.isMobileDevice() && e.documentElement.clientWidth < 668 && ( e.body.addEventListener( 'touchmove', this.preventDefaultEvent ), this.saveScrollPosition() );
				},
				maximizeAskQuestion: function() {
					this.wrapper.classList.contains( 'is-minimized' ) && ( this.wrapper.classList.remove( 'is-minimized' ), this.wrapper.classList.add( 'is-maximizing' ) ), this.wrapper.classList.remove( 'is-hidden' ), this.wrapper.classList.add( 'directly-rtm', 'is-ask-form' ), this.iframe.height = '', this.iframe.width = '', setTimeout( function() {
						this.wrapper.classList.remove( 'is-maximizing' );
					}.bind( this ), 110 ), this.utils.isMobileDevice() && e.documentElement.clientWidth < 668 && ( e.body.addEventListener( 'touchmove', this.preventDefaultEvent ), this.saveScrollPosition() );
				},
				minimize: function() {
					this.wrapper.classList.add( 'directly-rtm', 'is-minimized', 'is-minimizing' ), this.wrapper.classList.remove( 'is-ask-form', 'is-hidden' ), this.wrapper.height = '', this.wrapper.width = '', setTimeout( function() {
						this.wrapper.classList.remove( 'is-minimizing' );
					}.bind( this ), 90 ), this.utils.isMobileDevice() && e.documentElement.clientWidth < 668 && ( e.body.removeEventListener( 'touchmove', this.preventDefaultEvent ), this.restoreScrollPosition() );
				},
				resetHeight: function() {
					this.wrapper.style.height = '';
				},
				setHeight: function( t ) {
					const e = t.height;
					e && ( this.wrapper.style.height = e );
				},
				eventListener: function s( t ) {
					let e = t.callbackName,
						i = t.data,
						x = this.eventListeners[ e ];
					'function' == typeof x && x.call( void 0, i );
				}
			}, r.prototype.eventListeners = {
				onAskQuestion: void 0,
				onList: void 0,
				onReady: void 0,
				onNavigate: void 0
			}, r.prototype.processPostMessage = function( t ) {
				let e = t.data.command,
					i = t.data.params;
				t.origin !== this.baseUrl && t.source !== this.iframe.contentWindow || Object.keys( this.postMessageCommands ).indexOf( e ) > -1 && this.postMessageCommands[ e ].call( this, i );
			}, r.prototype.onLoad = function() {
				this.iframe.contentWindow.postMessage( {
					action: 'ready',
					params: this.config
				}, this.iframe.src ), this.initEventsAPI();
			}, r.prototype.setBaseUrl = function() {
				// This function had been modified from the original vendor code to remove
				// the baseUrl's reliance on the DOM.

				// ---------------------------------------------------------------------
				// ORIGINAL VENDOR CODE
				// let t = e.getElementById( 'directlyRTMScript' ),
				// 	i = e.createElement( 'a' ),
				// 	n = '';
				// i.href = t.src, n += i.protocol, n += '//', n += i.hostname, n += i.port ? ':' + i.port : '', this.baseUrl = n;
				// ---------------------------------------------------------------------

				// ---------------------------------------------------------------------
				// CUSTOM CODE
				this.baseUrl = baseUrl;
				// ---------------------------------------------------------------------
			}, r.prototype.initEventsAPI = function() {
				t[ n ] = function( t, e ) {
						this.iframe.contentWindow.postMessage( {
								action: t,
								params: e
							}, this.iframe.src );
					}.bind( this );
			}, r.prototype.preventDefaultEvent = function( t ) {
					t.preventDefault();
				}, r.prototype.setScrollPosition = function() {
						let i = e.documentElement,
							n = ( t.pageYOffset || i.scrollTop ) - ( i.clientTop || 0 );
						this.scrollPosition = n;
					}, r.prototype.saveScrollPosition = function() {
						this.setScrollPosition(), e.body.style.marginTop = -Math.abs( this.scrollPosition ) + 'px', e.body.classList.add( 'directly-rtm-is-open' );
					}, r.prototype.restoreScrollPosition = function() {
						e.body.classList.remove( 'directly-rtm-is-open' ), e.body.style.marginTop = '', t.scrollTo( 0, this.scrollPosition );
					}, r.prototype.initCommandQueue = function() {
						for ( let e = t[ n ].cq, i = 0; i < e.length; i++ ) {this.processCommand.apply( this, e[ i ] );}
					}, r.prototype.processCommand = function( t, e ) {
						if ( 'config' === t ) {this.config = ( 0, o.default )( this.config, e );}
						else {
							if ( ! ( Object.keys( this.eventListeners ).indexOf( t ) > -1 ) ) {throw new Error( 'Unknown command: ' + t );}
							this.registerEventListener( t, e );
						}
					}, r.prototype.registerEventListener = function( t, e ) {
						if ( ! e ) {throw new Error( "EventListener '" + t + "' requires a callback method." );}
						this.eventListeners[ t ] = e;
					}, r.prototype.utils = {
						isMobileDevice: function() {
							let e = navigator.userAgent || navigator.vendor || t.opera,
								i = ! 1;
							return ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test( e ) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test( e.substr( 0, 4 ) ) ) && ( i = ! 0 ), i;
						}
					}, new r;
		}( window, document );
	}, function( t, e, i ) {
		function n( t ) {
			return null != t && s( r( t ) ) && ! o( t );
		}
		let r = i( 19 ),
			o = i( 26 ),
			s = i( 8 );
		t.exports = n;
	}, function( t, e, i ) {
		function n( t, e, i ) {
			const n = t[ e ];
			s.call( t, e ) && r( n, i ) && ( void 0 !== i || e in t ) || ( t[ e ] = i );
		}
		let r = i( 6 ),
			o = Object.prototype,
			s = o.hasOwnProperty;
		t.exports = n;
	}, function( t, e ) {
		function i( t, e ) {
			return e = null == e ? n : e, !! e && ( 'number' == typeof t || r.test( t ) ) && t > -1 && t % 1 == 0 && t < e;
		}
		let n = 9007199254740991,
			r = /^(?:0|[1-9]\d*)$/;
		t.exports = i;
	}, function( t, e ) {
		function i( t ) {
			let e = t && t.constructor,
				i = 'function' == typeof e && e.prototype || n;
			return t === i;
		}
		const n = Object.prototype;
		t.exports = i;
	}, function( t, e ) {
		function i( t, e ) {
			return function( i ) {
				return t( e( i ) );
			};
		}
		t.exports = i;
	}, function( t, e ) {
		function i( t, e ) {
			return t === e || t !== t && e !== e;
		}
		t.exports = i;
	}, function( t, e ) {
		const i = Array.isArray;
		t.exports = i;
	}, function( t, e ) {
		function i( t ) {
			return 'number' == typeof t && t > -1 && t % 1 == 0 && t <= n;
		}
		const n = 9007199254740991;
		t.exports = i;
	}, function( t, e ) {
		function i( t ) {
			const e = typeof t;
			return !! t && ( 'object' == e || 'function' == e );
		}
		t.exports = i;
	}, function( t, e ) {
		function i( t ) {
			return !! t && 'object' == typeof t;
		}
		t.exports = i;
	}, function( t, e ) {
		function i( t, e, i ) {
			switch ( i.length ) {
				case 0:
					return t.call( e );
				case 1:
					return t.call( e, i[ 0 ] );
				case 2:
					return t.call( e, i[ 0 ], i[ 1 ] );
				case 3:
					return t.call( e, i[ 0 ], i[ 1 ], i[ 2 ] );
			}
			return t.apply( e, i );
		}
		t.exports = i;
	}, function( t, e, i ) {
		function n( t, e ) {
			return null != t && ( s.call( t, e ) || 'object' == typeof t && e in t && null === r( t ) );
		}
		let r = i( 20 ),
			o = Object.prototype,
			s = o.hasOwnProperty;
		t.exports = n;
	}, function( t, e, i ) {
		let n = i( 5 ),
			r = Object.keys,
			o = n( r, Object );
		t.exports = o;
	}, function( t, e ) {
		function i( t ) {
			return function( e ) {
				return null == e ? void 0 : e[ t ];
			};
		}
		t.exports = i;
	}, function( t, e, i ) {
		function n( t, e ) {
			return e = o( void 0 === e ? t.length - 1 : e, 0 ),
							function() {
								for ( var i = arguments, n = -1, s = o( i.length - e, 0 ), a = Array( s ); ++n < s; ) {a[ n ] = i[ e + n ];}
								n = -1;
								for ( var c = Array( e + 1 ); ++n < e; ) {c[ n ] = i[ n ];}
								return c[ e ] = a, r( t, this, c );
							};
		}
		let r = i( 11 ),
			o = Math.max;
		t.exports = n;
	}, function( t, e ) {
		function i( t, e ) {
			for ( var i = -1, n = Array( t ); ++i < t; ) {n[ i ] = e( i );}
			return n;
		}
		t.exports = i;
	}, function( t, e, i ) {
		function n( t, e, i, n ) {
			i || ( i = {} );
			for ( let o = -1, s = e.length; ++o < s; ) {
				let a = e[ o ],
					c = n ? n( i[ a ], t[ a ], a, i, t ) : void 0;
				r( i, a, void 0 === c ? t[ a ] : c );
			}
			return i;
		}
		const r = i( 2 );
		t.exports = n;
	}, function( t, e, i ) {
		function n( t ) {
			return r( function( e, i ) {
				let n = -1,
					r = i.length,
					s = r > 1 ? i[ r - 1 ] : void 0,
					a = r > 2 ? i[ 2 ] : void 0;
				for ( s = t.length > 3 && 'function' == typeof s ? ( r--, s ) : void 0, a && o( i[ 0 ], i[ 1 ], a ) && ( s = r < 3 ? void 0 : s, r = 1 ), e = Object( e ); ++n < r; ) {
					const c = i[ n ];
					c && t( e, c, n, s );
				}
				return e;
			} );
		}
		let r = i( 15 ),
			o = i( 22 );
		t.exports = n;
	}, function( t, e, i ) {
		let n = i( 14 ),
			r = n( 'length' );
		t.exports = r;
	}, function( t, e, i ) {
		let n = i( 5 ),
			r = Object.getPrototypeOf,
			o = n( r, Object );
		t.exports = o;
	}, function( t, e, i ) {
		function n( t ) {
			const e = t ? t.length : void 0;
			return a( e ) && ( s( t ) || c( t ) || o( t ) ) ? r( e, String ) : null;
		}
		let r = i( 16 ),
			o = i( 24 ),
			s = i( 7 ),
			a = i( 8 ),
			c = i( 27 );
		t.exports = n;
	}, function( t, e, i ) {
		function n( t, e, i ) {
			if ( ! a( i ) ) {return ! 1;}
			const n = typeof e;
			return !! ( 'number' == n ? o( i ) && s( e, i.length ) : 'string' == n && e in i ) && r( i[ e ], t );
		}
		let r = i( 6 ),
			o = i( 1 ),
			s = i( 3 ),
			a = i( 9 );
		t.exports = n;
	}, function( t, e, i ) {
		let n = i( 2 ),
			r = i( 17 ),
			o = i( 18 ),
			s = i( 1 ),
			a = i( 4 ),
			c = i( 28 ),
			p = Object.prototype,
			l = p.hasOwnProperty,
			u = p.propertyIsEnumerable,
			m = ! u.call( {
				valueOf: 1
			}, 'valueOf' ),
			d = o( function( t, e ) {
				if ( m || a( e ) || s( e ) ) {return void r( e, c( e ), t );}
				for ( const i in e ) {l.call( e, i ) && n( t, i, e[ i ] );}
			} );
		t.exports = d;
	}, function( t, e, i ) {
		function n( t ) {
			return r( t ) && a.call( t, 'callee' ) && ( ! p.call( t, 'callee' ) || c.call( t ) == o );
		}
		let r = i( 25 ),
			o = '[object Arguments]',
			s = Object.prototype,
			a = s.hasOwnProperty,
			c = s.toString,
			p = s.propertyIsEnumerable;
		t.exports = n;
	}, function( t, e, i ) {
		function n( t ) {
			return o( t ) && r( t );
		}
		let r = i( 1 ),
			o = i( 10 );
		t.exports = n;
	}, function( t, e, i ) {
		function n( t ) {
			const e = r( t ) ? c.call( t ) : '';
			return e == o || e == s;
		}
		let r = i( 9 ),
			o = '[object Function]',
			s = '[object GeneratorFunction]',
			a = Object.prototype,
			c = a.toString;
		t.exports = n;
	}, function( t, e, i ) {
		function n( t ) {
			return 'string' == typeof t || ! r( t ) && o( t ) && c.call( t ) == s;
		}
		let r = i( 7 ),
			o = i( 10 ),
			s = '[object String]',
			a = Object.prototype,
			c = a.toString;
		t.exports = n;
	}, function( t, e, i ) {
		function n( t ) {
			const e = p( t );
			if ( ! e && ! a( t ) ) {return o( t );}
			let i = s( t ),
				n = !! i,
				l = i || [],
				u = l.length;
			for ( const m in t ) {! r( t, m ) || n && ( 'length' == m || c( m, u ) ) || e && 'constructor' == m || l.push( m );}
			return l;
		}
		let r = i( 12 ),
			o = i( 13 ),
			s = i( 21 ),
			a = i( 1 ),
			c = i( 3 ),
			p = i( 4 );
		t.exports = n;
	} ] );
};

const DIRECTLY_BASE_URL = 'https://www.directly.com';
let isInitialized = false;

export const initializeDirectly = ( config, baseUrl = DIRECTLY_BASE_URL ) => {
	// Havoc is wreaked if you try to reload or even reconfigure the widget. Protect
	// against that with a flag:
	if ( isInitialized ) {
		return;
	}

	isInitialized = true;

	// Set up the global DirectlyRTM function, required for the Directly library
	window.DirectlyRTM = window.DirectlyRTM || function() {
		( window.DirectlyRTM.cq = window.DirectlyRTM.cq || [] ).push( arguments );
	};

	// Before loading the script, we need to enqueue the config details
	window.DirectlyRTM( 'config', config );

	executeVendorScript( baseUrl );

	// Note: It seems like it would make sense to `return window.DirectlyRTM;` so that
	// other consumers could abstract that away, but once the iframe loads,
	// `window.DirectlyRTM` is re-assigned so that any reference returned before then
	// will be stale. Consumers should just use `window.DirectlyRTM`.
};
