/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Context from '../container/context';

/**
 * Block edit function
 *
 * @typedef { import('./').Attributes } Attributes
 * @typedef { object } Props
 * @property { boolean } isSelected
 * @property { string } className
 * @property { string } clientId
 * @property { string } containerClientId
 * @property { Attributes } attributes
 * @property { Function } setAttributes
 * @property { Function } selectBlock
 *
 * @param { Props } props Properties
 */
function Edit( { context, innerBlocks, selectBlock, setRecurringPaymentsPlan } ) {
	const planId = context[ 'premium-content/planId' ];

	useEffect( () => {
		selectBlock();
	}, [] );

	useEffect( () => {
		// Updates the plan on any Recurring Payment inner block.
		setRecurringPaymentsPlan( planId );
	}, [ planId, innerBlocks ] );

	return (
		<Context.Consumer>
			{ ( { selectedTab, stripeNudge } ) => (
				/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
				// eslint-disable-next-line
				<div hidden={ selectedTab.id === 'premium' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks
						templateLock={ false }
						template={ [
							[
								'core/heading',
								{ content: __( 'Subscribe to get access', 'full-site-editing' ), level: 3 },
							],
							[
								'core/paragraph',
								{
									content: __(
										'Read more of this content when you subscribe today.',
										'full-site-editing'
									),
								},
							],
							[
								'core/buttons',
								{},
								[
									[
										'jetpack/recurring-payments',
										{
											planId,
											submitButtonText: __( 'Subscribe', 'full-site-editing' ),
										},
									],
									[ 'premium-content/login-button' ],
								],
							],
						] }
					/>
				</div>
			) }
		</Context.Consumer>
	);
}

export default compose( [
	withSelect( ( select, props ) => {
		const { getBlock, getBlockHierarchyRootClientId } = select( 'core/block-editor' );
		return {
			// @ts-ignore difficult to type with JSDoc
			containerClientId: getBlockHierarchyRootClientId( props.clientId ),
			innerBlocks: getBlock( props.clientId ).innerBlocks,
		};
	} ),
	withDispatch( ( dispatch, props, registry ) => {
		const { selectBlock } = dispatch( 'core/block-editor' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type with JSDoc
				selectBlock( props.containerClientId );
			},
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
						updateBlockAttributes( block.clientId, {
							planId,
						} );
					}

					block.innerBlocks.forEach( updatePlanAttribute );
				};

				const block = getBlock( props.clientId );
				updatePlanAttribute( block );
			},
		};
	} ),
] )( Edit );
