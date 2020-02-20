! ( function( e ) {
	var t = {};
	function n( r ) {
		if ( t[ r ] ) return t[ r ].exports;
		var c = ( t[ r ] = { i: r, l: ! 1, exports: {} } );
		return e[ r ].call( c.exports, c, c.exports, n ), ( c.l = ! 0 ), c.exports;
	}
	( n.m = e ),
		( n.c = t ),
		( n.d = function( e, t, r ) {
			n.o( e, t ) || Object.defineProperty( e, t, { enumerable: ! 0, get: r } );
		} ),
		( n.r = function( e ) {
			'undefined' != typeof Symbol &&
				Symbol.toStringTag &&
				Object.defineProperty( e, Symbol.toStringTag, { value: 'Module' } ),
				Object.defineProperty( e, '__esModule', { value: ! 0 } );
		} ),
		( n.t = function( e, t ) {
			if ( ( 1 & t && ( e = n( e ) ), 8 & t ) ) return e;
			if ( 4 & t && 'object' == typeof e && e && e.__esModule ) return e;
			var r = Object.create( null );
			if (
				( n.r( r ),
				Object.defineProperty( r, 'default', { enumerable: ! 0, value: e } ),
				2 & t && 'string' != typeof e )
			)
				for ( var c in e )
					n.d(
						r,
						c,
						function( t ) {
							return e[ t ];
						}.bind( null, c )
					);
			return r;
		} ),
		( n.n = function( e ) {
			var t =
				e && e.__esModule
					? function() {
							return e.default;
					  }
					: function() {
							return e;
					  };
			return n.d( t, 'a', t ), t;
		} ),
		( n.o = function( e, t ) {
			return Object.prototype.hasOwnProperty.call( e, t );
		} ),
		( n.p = '' ),
		n( ( n.s = 6 ) );
} )( [
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.element;
		} )();
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.i18n;
		} )();
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.components;
		} )();
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.date;
		} )();
	},
	function( e, t ) {
		e.exports = function( e, t, n ) {
			return (
				t in e
					? Object.defineProperty( e, t, {
							value: n,
							enumerable: ! 0,
							configurable: ! 0,
							writable: ! 0,
					  } )
					: ( e[ t ] = n ),
				e
			);
		};
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.blocks;
		} )();
	},
	function( e, t, n ) {
		'use strict';
		n.r( t );
		var r = n( 4 ),
			c = n.n( r ),
			o = n( 5 ),
			a = n( 0 ),
			l = n( 2 ),
			i = function() {
				return Object( a.createElement )(
					l.SVG,
					{ xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24' },
					Object( a.createElement )( l.Path, {
						d:
							'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
					} )
				);
			},
			u = n( 3 ),
			s = n( 1 ),
			b = function( e ) {
				var t = e.attributes,
					n = e.setAttributes,
					r = e.className,
					c = Object( u.__experimentalGetSettings )(),
					o = Object( s.__ )( 'Choose Date' );
				return (
					t.eventDate && ( o = Object( u.dateI18n )( c.formats.datetimeAbbreviated, t.eventDate ) ),
					Object( a.createElement )(
						l.Placeholder,
						{
							label: Object( s.__ )( 'Event Countdown' ),
							instructions: Object( s.__ )(
								'Count down to an event. Set a title and pick a time and date.'
							),
							icon: Object( a.createElement )( i, null ),
							className: r,
						},
						Object( a.createElement )(
							'div',
							null,
							Object( a.createElement )( 'strong', null, 'Title:' ),
							Object( a.createElement )( 'br', null ),
							Object( a.createElement )( 'input', {
								type: 'text',
								value: t.eventTitle,
								onChange: function( e ) {
									return n( { eventTitle: e.target.value } );
								},
								placeholder: Object( s.__ )( 'Event Title' ),
								className: 'event-countdown__event-title',
								'aria-label': Object( s.__ )( 'Event Title' ),
							} )
						),
						Object( a.createElement )(
							'div',
							null,
							Object( a.createElement )( 'strong', null, 'Date:' ),
							Object( a.createElement )( 'br', null ),
							Object( a.createElement )( l.Dropdown, {
								position: 'bottom left',
								renderToggle: function( e ) {
									var t = e.onToggle,
										n = e.isOpen;
									return Object( a.createElement )(
										l.Button,
										{ className: 'button', onClick: t, 'aria-expanded': n, 'aria-live': 'polite' },
										o
									);
								},
								renderContent: function() {
									return Object( a.createElement )( l.DateTimePicker, {
										key: 'event-countdown-picker',
										onChange: function( e ) {
											return n( { eventDate: e } );
										},
										currentDate: t.eventDate,
									} );
								},
							} )
						)
					)
				);
			},
			p = function( e ) {
				var t = e.attributes,
					n = e.className,
					r = '&nbsp;',
					c = '&nbsp;',
					o = '&nbsp;',
					l = '&nbsp;';
				if ( e.isEditView ) {
					r = c = o = l = 0;
					var i = new Date( t.eventDate ).getTime() - Date.now();
					if ( i > 0 ) {
						var u = Math.round( i / 1e3 );
						( u -= 24 * ( r = Math.floor( u / 86400 ) ) * 60 * 60 ),
							( u -= 60 * ( c = Math.floor( u / 3600 ) ) * 60 ),
							( l = u -= 60 * ( o = Math.floor( u / 60 ) ) );
					}
				}
				return Object( a.createElement )(
					'div',
					{ className: n },
					Object( a.createElement )( 'div', { className: 'event-countdown__date' }, t.eventDate ),
					Object( a.createElement )(
						'div',
						{ className: 'event-countdown__counter' },
						Object( a.createElement )(
							'p',
							null,
							Object( a.createElement )( 'strong', { className: 'event-countdown__day' }, r ),
							' ',
							Object( s.__ )( 'days' )
						),
						Object( a.createElement )(
							'p',
							null,
							Object( a.createElement )(
								'span',
								null,
								Object( a.createElement )( 'strong', { className: 'event-countdown__hour' }, c ),
								' ',
								Object( s.__ )( 'hours' )
							),
							Object( a.createElement )(
								'span',
								null,
								Object( a.createElement )( 'strong', { className: 'event-countdown__minute' }, o ),
								' ',
								Object( s.__ )( 'minutes' )
							),
							Object( a.createElement )(
								'span',
								null,
								Object( a.createElement )( 'strong', { className: 'event-countdown__second' }, l ),
								' ',
								Object( s.__ )( 'seconds' )
							)
						),
						Object( a.createElement )( 'p', null, Object( s.__ )( 'until' ) )
					),
					Object( a.createElement )(
						'div',
						{ className: 'event-countdown__event-title' },
						Object( a.createElement )( 'p', null, t.eventTitle )
					)
				);
			};
		function d( e, t ) {
			var n = Object.keys( e );
			if ( Object.getOwnPropertySymbols ) {
				var r = Object.getOwnPropertySymbols( e );
				t &&
					( r = r.filter( function( t ) {
						return Object.getOwnPropertyDescriptor( e, t ).enumerable;
					} ) ),
					n.push.apply( n, r );
			}
			return n;
		}
		Object( o.registerBlockType )( 'jetpack/event-countdown', {
			title: 'Event Countdown',
			description:
				'Count down to your favorite next thing, and celebrate with fireworks when the time is right!',
			icon: i,
			category: 'widgets',
			supports: { align: [ 'wide', 'full' ] },
			example: {
				attributes: { eventDate: '2024-04-08T11:38:32', eventTitle: 'Total Solar Eclipse' },
			},
			attributes: {
				eventTitle: { type: 'string', source: 'text', selector: '.event-countdown__event-title' },
				eventDate: { type: 'string' },
			},
			edit: function( e ) {
				return e.isSelected
					? b( e )
					: p(
							( function( e ) {
								for ( var t = 1; t < arguments.length; t++ ) {
									var n = null != arguments[ t ] ? arguments[ t ] : {};
									t % 2
										? d( n, ! 0 ).forEach( function( t ) {
												c()( e, t, n[ t ] );
										  } )
										: Object.getOwnPropertyDescriptors
										? Object.defineProperties( e, Object.getOwnPropertyDescriptors( n ) )
										: d( n ).forEach( function( t ) {
												Object.defineProperty( e, t, Object.getOwnPropertyDescriptor( n, t ) );
										  } );
								}
								return e;
							} )( {}, e, { isEditView: ! 0 } )
					  );
			},
			save: p,
		} );
	},
] );
