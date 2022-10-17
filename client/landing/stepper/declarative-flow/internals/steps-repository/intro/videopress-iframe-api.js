/* eslint-disable */
! ( function ( e, n ) {
	'object' == typeof exports && 'object' == typeof module
		? ( module.exports = n() )
		: 'function' == typeof define && define.amd
		? define( [], n )
		: 'object' == typeof exports
		? ( exports.VideoPressIframeApi = n() )
		: ( e.VideoPressIframeApi = n() );
} )( this, () =>
	( () => {
		'use strict';
		var e = {
				d: ( n, t ) => {
					for ( var r in t )
						e.o( t, r ) &&
							! e.o( n, r ) &&
							Object.defineProperty( n, r, { enumerable: ! 0, get: t[ r ] } );
				},
				o: ( e, n ) => Object.prototype.hasOwnProperty.call( e, n ),
			},
			n = {};
		function t( e ) {
			return (
				( function ( e ) {
					if ( Array.isArray( e ) ) return r( e );
				} )( e ) ||
				( function ( e ) {
					if (
						( 'undefined' != typeof Symbol && null != e[ Symbol.iterator ] ) ||
						null != e[ '@@iterator' ]
					)
						return Array.from( e );
				} )( e ) ||
				( function ( e, n ) {
					if ( e ) {
						if ( 'string' == typeof e ) return r( e, n );
						var t = Object.prototype.toString.call( e ).slice( 8, -1 );
						return (
							'Object' === t && e.constructor && ( t = e.constructor.name ),
							'Map' === t || 'Set' === t
								? Array.from( e )
								: 'Arguments' === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test( t )
								? r( e, n )
								: void 0
						);
					}
				} )( e ) ||
				( function () {
					throw new TypeError(
						'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
					);
				} )()
			);
		}
		function r( e, n ) {
			( null == n || n > e.length ) && ( n = e.length );
			for ( var t = 0, r = new Array( n ); t < n; t++ ) r[ t ] = e[ t ];
			return r;
		}
		function o( e, n ) {
			for ( var t = 0; t < n.length; t++ ) {
				var r = n[ t ];
				( r.enumerable = r.enumerable || ! 1 ),
					( r.configurable = ! 0 ),
					'value' in r && ( r.writable = ! 0 ),
					Object.defineProperty( e, r.key, r );
			}
		}
		function i( e, n, t ) {
			return (
				n && o( e.prototype, n ),
				t && o( e, t ),
				Object.defineProperty( e, 'prototype', { writable: ! 1 } ),
				e
			);
		}
		function a( e, n ) {
			if ( ! ( e instanceof n ) ) throw new TypeError( 'Cannot call a class as a function' );
		}
		function s( e, n, t ) {
			return (
				n in e
					? Object.defineProperty( e, n, {
							value: t,
							enumerable: ! 0,
							configurable: ! 0,
							writable: ! 0,
					  } )
					: ( e[ n ] = t ),
				e
			);
		}
		e.d( n, { default: () => u } );
		const u = function ( e ) {
			var n = arguments.length > 1 && void 0 !== arguments[ 1 ] ? arguments[ 1 ] : null,
				r = 'channel_init',
				o = 'result',
				u = 'error',
				c = 'event',
				l = i( function e( n ) {
					var i = this,
						l = arguments.length > 1 && void 0 !== arguments[ 1 ] ? arguments[ 1 ] : null;
					a( this, e ),
						s( this, 'initListener', function () {
							i.iframe.addEventListener( 'load', function () {
								return i.onIframeLoaded();
							} );
						} ),
						s( this, 'onIframeLoaded', function () {
							( i.channel = new MessageChannel() ),
								( i.channel.port1.onmessage = function ( e ) {
									return i.onMessageReceived( e );
								} ),
								i.iframe.contentWindow.postMessage( { event: r }, '*', [ i.channel.port2 ] );
						} ),
						s( this, 'onChannelInitialized', function () {
							i.onReadyCallback && i.onReadyCallback();
						} ),
						s( this, 'postMessage', function ( e ) {
							var n = arguments.length > 1 && void 0 !== arguments[ 1 ] ? arguments[ 1 ] : null,
								t = arguments.length > 2 && void 0 !== arguments[ 2 ] ? arguments[ 2 ] : null;
							if ( null !== i.channel ) {
								var r = { event: e };
								null !== n && Array.isArray( n ) && ( r.args = n ),
									null !== t && ( r.xchgId = t ),
									i.channel.port1.postMessage( r );
							}
						} ),
						s( this, 'generateXchgId', function () {
							return ++i.currentXchgId;
						} ),
						s( this, 'generateListenerId', function () {
							return ++i.currentEventListenerId;
						} ),
						s( this, 'callMethod', function ( e ) {
							var n = arguments.length > 1 && void 0 !== arguments[ 1 ] ? arguments[ 1 ] : null,
								t = i.generateXchgId();
							return new Promise( function ( r, o ) {
								( i.pendingResolvers[ t ] = { resolve: r, reject: o } ), i.postMessage( e, n, t );
							} );
						} ),
						s( this, 'listen', function ( e, n ) {
							if ( ! i.eventListenersByEvent[ e ] ) return ! 1;
							var t = i.generateListenerId();
							return (
								( i.eventListenersById[ t ] = { event: e, callback: n } ),
								i.eventListenersByEvent[ e ].push( t ),
								t
							);
						} ),
						s( this, 'stopListening', function ( e ) {
							if ( ( ( e = Number( e ) ), i.eventListenersById[ e ] ) ) {
								var n = i.eventListenersById[ e ],
									t = i.eventListenersByEvent[ n.event ].findIndex( function ( n ) {
										return e === n;
									} );
								void 0 !== t && i.eventListenersByEvent[ n.event ].splice( t, 1 ),
									delete i.eventListenersById[ e ];
							}
						} ),
						s( this, 'onMessageReceived', function ( e ) {
							var n,
								t,
								o = null !== ( n = e.data.event ) && void 0 !== n && n;
							if ( o )
								if ( r !== o ) {
									var a = null !== ( t = e.data.xchgId ) && void 0 !== t ? t : 0;
									a ? i.onMessageReceivedWithXchgId( a, o, e ) : c === o && i.onEventReceived( e );
								} else i.onChannelInitialized();
						} ),
						s( this, 'onEventReceived', function ( e ) {
							var n,
								r,
								o = null !== ( n = e.data.type ) && void 0 !== n ? n : '';
							if ( o && i.eventListenersByEvent[ o ] ) {
								var a = null !== ( r = e.data.args ) && void 0 !== r ? r : [];
								i.eventListenersByEvent[ o ].forEach( function ( e ) {
									var n,
										r = null !== ( n = i.eventListenersById[ e ] ) && void 0 !== n ? n : null;
									r && r.callback.apply( r, t( a ) );
								} );
							}
						} ),
						s( this, 'onMessageReceivedWithXchgId', function ( e, n, t ) {
							if ( i.pendingResolvers[ e ] ) {
								var r = i.pendingResolvers[ e ];
								delete i.pendingResolvers[ e ],
									u === n
										? r.reject( t.data.code, t.data.message )
										: o === n && r.resolve( t.data.message.result );
							}
						} ),
						( this.currentXchgId = 0 ),
						( this.currentEventListenerId = 0 ),
						( this.pendingResolvers = {} ),
						( this.eventListenersById = {} ),
						( this.eventListenersByEvent = {
							'status.fullscreenChanged': [],
							'status.playerStatusChanged': [],
							'status.playbackTimeUpdated': [],
							'status.timeUpdate': [],
							'info.infoUpdated': [],
						} ),
						( this.onReadyCallback = l ),
						( this.channel = null ),
						( this.iframe = n ),
						this.initListener();
				} ),
				f = new l( e, n );
			return {
				status: {
					fullscreen: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'status.fullscreen', [] ).then( e ).catch( n );
						} );
					},
					onFullscreenChanged: function ( e ) {
						return f.listen( 'status.fullscreenChanged', e );
					},
					offFullscreenChanged: function ( e ) {
						return f.stopListening( e );
					},
					player: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'status.player', [] ).then( e ).catch( n );
						} );
					},
					onPlayerStatusChanged: function ( e ) {
						return f.listen( 'status.playerStatusChanged', e );
					},
					offPlayerStatusChanged: function ( e ) {
						return f.stopListening( e );
					},
					audio: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'status.audio', [] ).then( e ).catch( n );
						} );
					},
					playbackTime: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'status.playbackTime', [] ).then( e ).catch( n );
						} );
					},
					onPlaybackTimeUpdated: function ( e ) {
						return f.listen( 'status.playbackTimeUpdated', e );
					},
					offPlaybackTimeUpdated: function ( e ) {
						return f.stopListening( e );
					},
					onTimeUpdate: function ( e ) {
						return f.listen( 'status.timeUpdate', e );
					},
					offTimeUpdate: function ( e ) {
						return f.stopListening( e );
					},
				},
				controls: {
					play: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'controls.play', [] ).then( e ).catch( n );
						} );
					},
					pause: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'controls.pause', [] ).then( e ).catch( n );
						} );
					},
					seek: function ( e ) {
						return new Promise( function ( n, t ) {
							if ( ( ( e = Number( e ) ), ! isNaN( e ) ) )
								return f.callMethod( 'controls.seek', [ e ] ).then( n ).catch( t );
							t( 'Invalid argument provided for timeMs' );
						} );
					},
					volume: function ( e ) {
						return new Promise( function ( n, t ) {
							if ( ( ( e = Number( e ) ), ! isNaN( e ) ) )
								return f.callMethod( 'controls.volume', [ e ] ).then( n ).catch( t );
							t( 'Invalid argument provided for volume' );
						} );
					},
					mute: function ( e ) {
						return new Promise( function ( n, t ) {
							return (
								( e =
									( ! ( 'toLowerCase' in Object( e ) ) ||
										( 'false' !== e.toLowerCase() && '0' !== e ) ) &&
									Boolean( e ) ),
								f.callMethod( 'controls.mute', [ e ] ).then( n ).catch( t )
							);
						} );
					},
					fullscreen: function ( e ) {
						return new Promise( function ( n, t ) {
							return (
								( e =
									( ! ( 'toLowerCase' in Object( e ) ) ||
										( 'false' !== e.toLowerCase() && '0' !== e ) ) &&
									Boolean( e ) ),
								f.callMethod( 'controls.fullscreen', [ e ] ).then( n ).catch( t )
							);
						} );
					},
				},
				info: {
					onInfoUpdated: function ( e ) {
						return f.listen( 'info.infoUpdated', e );
					},
					offInfoUpdated: function ( e ) {
						return f.stopListening( e );
					},
					duration: function () {
						var e =
							arguments.length > 0 && void 0 !== arguments[ 0 ]
								? arguments[ 0 ]
								: JSON.parse( ! 1 );
						return new Promise( function ( n, t ) {
							return (
								( e =
									( ! ( 'toLowerCase' in Object( e ) ) ||
										( 'false' !== e.toLowerCase() && '0' !== e ) ) &&
									Boolean( e ) ),
								f.callMethod( 'info.duration', [ e ] ).then( n ).catch( t )
							);
						} );
					},
					guid: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'info.guid', [] ).then( e ).catch( n );
						} );
					},
					title: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'info.title', [] ).then( e ).catch( n );
						} );
					},
					poster: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'info.poster', [] ).then( e ).catch( n );
						} );
					},
					privacy: function () {
						return new Promise( function ( e, n ) {
							return f.callMethod( 'info.privacy', [] ).then( e ).catch( n );
						} );
					},
					getThumbnailSample: function ( e ) {
						return new Promise( function ( n, t ) {
							if ( ( ( e = Number( e ) ), ! isNaN( e ) ) )
								return f.callMethod( 'info.getThumbnailSample', [ e ] ).then( n ).catch( t );
							t( 'Invalid argument provided for count' );
						} );
					},
				},
			};
		};
		return n.default;
	} )()
);
