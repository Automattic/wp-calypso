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
import { addFilter } from '@wordpress/hooks';

const ALLOWED_BLOCKS = [
	'core/button',
	'jetpack/recurring-payments',
	'premium-content/login-button',
];

// Inside buttons block alignment options are not supported.
const alignmentHooksSetting = {
	isEmbedButton: true,
};

function ButtonsEdit( {
	context,
	jetpackButton,
	subscribeButton,
	setSubscribeButtonText,
	setSubscribeButtonPlan,
} ) {
	const planId = context ? context[ 'premium-content/planId' ] : null;

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

	// Keep in sync the plan selected on the Premium Content block with the plan selected on the Recurring Payments
	// inner block acting as a subscribe button.
	useEffect( () => {
		if ( ! planId || ! subscribeButton ) {
			return;
		}

		if ( subscribeButton.attributes.planId !== planId ) {
			setSubscribeButtonPlan( planId );
		}
	}, [ planId, subscribeButton ] );

	// Hides the inspector controls of the Recurring Payments inner block acting as a subscribe button so users can only
	// switch plans using the plan selector of the Premium Content block.
	useEffect( () => {
		if ( ! subscribeButton ) {
			return;
		}
		addFilter(
			'jetpack.RecurringPayments.showControls',
			'full-site-editing/premium-content-hide-recurring-payments-controls',
			( showControls, clientId ) => {
				if ( clientId === subscribeButton.clientId ) {
					return false;
				}
				return showControls;
			}
		);
	}, [ subscribeButton ] );

	// Updates the subscribe button text.
	useEffect( () => {
		if ( ! jetpackButton ) {
			return;
		}
		setSubscribeButtonText( __( 'Subscribe', 'full-site-editing' ) );
	}, [ jetpackButton, setSubscribeButtonText ] );

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Block.div className="wp-block-buttons">
			<AlignmentHookSettingsProvider value={ alignmentHooksSetting }>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					template={ template }
					__experimentalMoverDirection="horizontal"
					templateInsertUpdatesSelection={ false }
				/>
			</AlignmentHookSettingsProvider>
		</Block.div>
	);
}

export default compose( [
	withSelect( ( select, props ) => {
		// Only first block is assumed to be a subscribe button (users can add additional Recurring Payments blocks for
		// other plans).
		const subscribeButton = select( 'core/block-editor' )
			.getBlock( props.clientId )
			.innerBlocks.find( ( block ) => block.name === 'jetpack/recurring-payments' );

		const jetpackButton = select( 'core/block-editor' )
			.getBlock( subscribeButton.clientId )
			.innerBlocks.find( ( block ) => block.name === 'jetpack/button' );
		return {
			subscribeButton,
			jetpackButton,
		};
	} ),
	withDispatch( ( dispatch, props ) => ( {
		/**
		 * Updates the plan on the Recurring Payments block acting as a subscribe button.
		 *
		 * @param planId {int} Plan ID.
		 */
		setSubscribeButtonPlan( planId ) {
			dispatch( 'core/block-editor' ).updateBlockAttributes( props.subscribeButton.clientId, {
				planId,
			} );
		},
		/**
		 * Updates the button text on the Recurring Payments block acting as a subscribe button.
		 *
		 * @param text {string} Button text.
		 */
		setSubscribeButtonText( text ) {
			dispatch( 'core/block-editor' ).updateBlockAttributes( props.jetpackButton.clientId, {
				text,
			} );
		},
	} ) ),
] )( ButtonsEdit );
