! ( function( e ) {
	var t = {};
	function n( c ) {
		if ( t[ c ] ) return t[ c ].exports;
		var r = ( t[ c ] = { i: c, l: ! 1, exports: {} } );
		return e[ c ].call( r.exports, r, r.exports, n ), ( r.l = ! 0 ), r.exports;
	}
	( n.m = e ),
		( n.c = t ),
		( n.d = function( e, t, c ) {
			n.o( e, t ) || Object.defineProperty( e, t, { enumerable: ! 0, get: c } );
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
			var c = Object.create( null );
			if (
				( n.r( c ),
				Object.defineProperty( c, 'default', { enumerable: ! 0, value: e } ),
				2 & t && 'string' != typeof e )
			)
				for ( var r in e )
					n.d(
						c,
						r,
						function( t ) {
							return e[ t ];
						}.bind( null, r )
					);
			return c;
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
		n( ( n.s = 5 ) );
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
			e.exports = this.wp.blockEditor;
		} )();
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.blocks;
		} )();
	},
	function( e, t ) {
		! ( function() {
			e.exports = this.wp.data;
		} )();
	},
	function( e, t, n ) {
		'use strict';
		n.r( t );
		var c = n( 0 ),
			r = n( 2 ),
			i = n( 3 ),
			l = n( 4 ),
			o = n( 1 ),
			a = wp.components,
			s = a.Path,
			m = a.SVG,
			u = function() {
				return Object( c.createElement )(
					m,
					{ xmlns: 'http://www.w3.org/2000/svg', width: '24', height: '24', viewBox: '0 0 24 24' },
					Object( c.createElement )( s, {
						d:
							'M21 6c-1.1 0-2 .9-2 2 0 .2 0 .3.1.5l-3.5 3.6c-.2-.1-.4-.1-.6-.1s-.4 0-.5.1L12 9.6V9c0-1.1-.9-2-2-2s-2 .9-2 2c0 .2 0 .4.1.5L3.5 14H3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.2 0-.3-.1-.5l4.5-4.6c.2.1.4.1.6.1s.4 0 .5-.1l2.5 2.5c0 .2-.1.3-.1.5 0 1.1.9 2 2 2s2-.9 2-2c0-.2 0-.4-.1-.5l3.6-3.5c.2 0 .3.1.5.1 1.1 0 2-.9 2-2s-.8-2-1.9-2z',
					} )
				);
			},
			b = function( e ) {
				var t = e.onClick;
				return Object( c.createElement )(
					'button',
					{
						className: 'block-editor-inserter__toggle timeline-item-appender',
						type: 'button',
						style: { zIndex: 99999 },
						onClick: t,
					},
					Object( c.createElement )(
						'svg',
						{
							'aria-hidden': 'true',
							role: 'img',
							focusable: 'false',
							xmlns: 'http://www.w3.org/2000/svg',
							width: '20',
							height: '20',
							viewBox: '0 0 20 20',
						},
						Object( c.createElement )( 'path', {
							d:
								'M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6z',
						} )
					),
					' ',
					Object( o.__ )( 'Add New Entry' )
				);
			};
		Object( i.registerBlockType )( 'jetpack/timeline', {
			title: 'Timeline',
			description: 'Create a timeline of events.',
			icon: u,
			category: 'widgets',
			example: {
				innerBlocks: [
					{
						name: 'jetpack/timeline-item',
						innerBlocks: [
							{ name: 'core/heading', attributes: { content: Object( o.__ )( 'Spring' ) } },
						],
					},
					{
						name: 'jetpack/timeline-item',
						innerBlocks: [
							{ name: 'core/heading', attributes: { content: Object( o.__ )( 'Summer' ) } },
						],
					},
					{
						name: 'jetpack/timeline-item',
						innerBlocks: [
							{ name: 'core/heading', attributes: { content: Object( o.__ )( 'Fall' ) } },
						],
					},
					{
						name: 'jetpack/timeline-item',
						innerBlocks: [
							{ name: 'core/heading', attributes: { content: Object( o.__ )( 'Winter' ) } },
						],
					},
				],
			},
			edit: function( e ) {
				var t = e.clientId,
					n = function() {
						var e = Object( i.createBlock )( 'jetpack/timeline-item' );
						Object( l.dispatch )( 'core/block-editor' ).insertBlock( e, void 0, t );
					};
				return Object( c.createElement )(
					c.Fragment,
					null,
					Object( c.createElement )(
						'ul',
						{ className: 'wp-block-jetpack-timeline' },
						Object( c.createElement )( r.InnerBlocks, {
							allowedBlocks: [ 'jetpack/timeline-item' ],
							template: [ [ 'jetpack/timeline-item' ] ],
							renderAppender: function() {
								return Object( c.createElement )( b, { onClick: n } );
							},
						} )
					)
				);
			},
			save: function() {
				return Object( c.createElement )(
					'ul',
					{ className: 'wp-block-jetpack-timeline' },
					Object( c.createElement )( r.InnerBlocks.Content, null )
				);
			},
		} ),
			Object( i.registerBlockType )( 'jetpack/timeline-item', {
				title: 'Timeline Entry',
				description: 'An entry on the timeline',
				icon: u,
				category: 'widgets',
				parent: [ 'jetpack/timeline' ],
				edit: function( e ) {
					var t = e.attributes,
						n = e.setAttributes,
						i = { backgroundColor: t.background },
						l = { borderColor: t.background };
					return Object( c.createElement )(
						'li',
						{ style: i },
						Object( c.createElement )(
							r.InspectorControls,
							null,
							Object( c.createElement )( r.PanelColorSettings, {
								title: Object( o.__ )( 'Color Settings' ),
								colorSettings: [
									{
										value: t.background,
										onChange: function( e ) {
											return n( { background: e } );
										},
										label: Object( o.__ )( 'Background Color' ),
									},
								],
							} )
						),
						Object( c.createElement )(
							'div',
							{ className: 'timeline-item' },
							Object( c.createElement )( 'div', { className: 'timeline-item__bubble', style: l } ),
							Object( c.createElement )( 'div', { className: 'timeline-item__dot', style: i } ),
							Object( c.createElement )( r.InnerBlocks, { template: [ [ 'core/heading' ] ] } )
						)
					);
				},
				save: function( e ) {
					var t = e.attributes,
						n = { backgroundColor: t.background },
						i = { borderColor: t.background };
					return Object( c.createElement )(
						'li',
						{ style: n },
						Object( c.createElement )(
							'div',
							{ className: 'timeline-item' },
							Object( c.createElement )( 'div', { className: 'timeline-item__bubble', style: i } ),
							Object( c.createElement )( 'div', { className: 'timeline-item__dot', style: n } ),
							Object( c.createElement )( r.InnerBlocks.Content, null )
						)
					);
				},
				attributes: { background: { type: 'string', default: '#eeeeee' } },
			} );
	},
] );
