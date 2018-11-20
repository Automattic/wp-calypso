( function() {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var InnerBlocks = wp.editor.InnerBlocks;
	var __ = wp.i18n.__;
	var TEMPLATE = [
		[ 'core/paragraph', {
			fontSize: 'large',
			content: 'Content…',
		} ],
	];

	var save = function() {
		return el( InnerBlocks.Content );
	};

	registerBlockType( 'test/test-inner-blocks-no-locking', {
		title: 'Test Inner Blocks no locking',
		icon: 'cart',
		category: 'common',

		edit: function( props ) {
			return el(
					InnerBlocks,
					{
						template: TEMPLATE,
					}
			);
		},

		save,
	} );

	registerBlockType( 'test/test-inner-blocks-locking-all', {
		title: 'Test InnerBlocks locking all',
		icon: 'cart',
		category: 'common',

		edit: function( props ) {
			return el(
					InnerBlocks,
					{
						template: TEMPLATE,
						templateLock: 'all',
					}
			);
		},

		save,
	} );
} )();
