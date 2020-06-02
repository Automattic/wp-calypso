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
function Edit( { selectBlock } ) {
	useEffect( () => {
		selectBlock();
	}, [] );

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
										'premium-content/button',
										{
											text: __( 'Subscribe', 'premium-content' ),
											type: 'subscribe',
										},
									],
									[
										'premium-content/button',
										{
											text: __( 'Log In', 'premium-content' ),
											type: 'login',
										},
									],
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
		const { getBlockHierarchyRootClientId } = select( 'core/block-editor' );
		return {
			// @ts-ignore difficult to type with JSDoc
			containerClientId: getBlockHierarchyRootClientId( props.clientId ),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const { selectBlock } = dispatch( 'core/block-editor' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type with JSDoc
				selectBlock( props.containerClientId );
			},
		};
	} ),
] )( Edit );
