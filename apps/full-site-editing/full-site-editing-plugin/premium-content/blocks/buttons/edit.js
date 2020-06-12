/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import {
	__experimentalAlignmentHookSettingsProvider as AlignmentHookSettingsProvider,
	InnerBlocks,
	__experimentalBlock as Block,
} from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const ALLOWED_BLOCKS = [
	'core/button',
	'jetpack/recurring-payments',
	'premium-content/login-button',
];

// Inside buttons block alignment options are not supported.
const alignmentHooksSetting = {
	isEmbedButton: true,
};

function ButtonsEdit( { context, innerBlocks, setRecurringPaymentsPlan } ) {
	const planId = context[ 'premium-content/planId' ];

	const template = [
		[
			'jetpack/recurring-payments',
			{
				planId,
				submitButtonText: __( 'Subscribe', 'full-site-editing' ),
			},
		],
		[ 'premium-content/login-button' ],
	];

	useEffect( () => {
		if ( planId ) {
			// Updates the plan on any Recurring Payment inner block.
			setRecurringPaymentsPlan( planId );
		}
	}, [ planId, innerBlocks ] );

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Block.div className="wp-block-buttons">
			<AlignmentHookSettingsProvider value={ alignmentHooksSetting }>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ template }
					__experimentalMoverDirection="horizontal"
				/>
			</AlignmentHookSettingsProvider>
		</Block.div>
	);
}

export default compose( [
	withSelect( ( select, props ) => ( {
		innerBlocks: select( 'core/block-editor' ).getBlock( props.clientId ).innerBlocks,
	} ) ),
	withDispatch( ( dispatch, props, registry ) => ( {
		/**
		 * Updates the selected plan on the Recurring Payments inner block.
		 *
		 * @param planId {int} Recurring Payments plan.
		 */
		setRecurringPaymentsPlan( planId ) {
			const { updateBlockAttributes } = dispatch( 'core/block-editor' );
			const { getBlock } = registry.select( 'core/block-editor' );

			const updatePlanAttribute = ( block ) => {
				if ( block.name === 'jetpack/recurring-payments' ) {
					updateBlockAttributes( block.clientId, { planId } );
				}

				block.innerBlocks.forEach( updatePlanAttribute );
			};

			const block = getBlock( props.clientId );
			updatePlanAttribute( block );
		},
	} ) ),
] )( ButtonsEdit );
