( function() {
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var Button = wp.components.Button;
	var PanelBody = wp.components.PanelBody;
	var InspectorControls = wp.editor.InspectorControls;
	var addFilter = wp.hooks.addFilter;
	var createBlock = wp.blocks.createBlock;
	var __ = wp.i18n.__;

	function ResetBlockButton( props ) {
		return el(
			PanelBody,
			{},
			el(
				Button,
				{
					className: 'e2e-reset-block-button',
					isDefault: true,
					isLarge: true,
					onClick: function() {
						var emptyBlock = createBlock( props.name );
						props.onReplace( emptyBlock );
					}
				},
				__( 'Reset Block' )
			)
		);
	}

	function addResetBlockButton( BlockEdit ) {
		return function( props ) {
			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						ResetBlockButton,
						{
							name: props.name,
							onReplace: props.onReplace
						}
					)
				),
				el(
					BlockEdit,
					props
				)
			);
		};
	}

	addFilter(
		'editor.BlockEdit',
		'e2e/hooks-api/add-reset-block-button',
		addResetBlockButton,
		100
	);
} )();
