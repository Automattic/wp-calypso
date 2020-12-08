/**
 * WordPress dependencies
 */
// eslint-disable-next-line wpcalypso/import-docblock
import { InnerBlocks, __experimentalBlock as Block } from '@wordpress/block-editor';
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

function ButtonsEdit( { context, subscribeButton, setSubscribeButtonPlan } ) {
	const planId = context ? context[ 'premium-content/planId' ] : null;
	const isPreview = context ? context[ 'premium-content/isPreview' ] : false;

	const previewTemplate = [
		[
			'core/button',
			{
				element: 'a',
				uniqueId: 'recurring-payments-id',
				text: __( 'Subscribe', 'full-site-editing' ),
			},
		],
		[ 'premium-content/login-button' ],
	];

	const template = [
		[
			'jetpack/recurring-payments',
			{ planId },
			[
				[
					'jetpack/button',
					{
						element: 'a',
						uniqueId: 'recurring-payments-id',
						text: __( 'Subscribe', 'full-site-editing' ),
					},
				],
			],
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
	}, [ planId, subscribeButton, setSubscribeButtonPlan ] );

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

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<Block.div className="wp-block-buttons">
			<InnerBlocks
				allowedBlocks={ ALLOWED_BLOCKS }
				template={ isPreview ? previewTemplate : template }
				templateInsertUpdatesSelection={ false }
				__experimentalLayout={ { type: 'default', alignments: [] } }
				__experimentalMoverDirection="horizontal"
			/>
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

		return subscribeButton;
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
	} ) ),
] )( ButtonsEdit );
