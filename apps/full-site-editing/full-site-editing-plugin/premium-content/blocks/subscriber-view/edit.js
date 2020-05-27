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
 * @typedef {object} Props
 * @property { string } clientId
 * @property { string } containerClientId
 * @property { () => void } selectBlock
 *
 * @param { Props } props
 */
function Edit( props ) {
	useEffect( () => {
		props.selectBlock();
		setBlockContext();
	}, [ props.context ] );

	function setBlockContext() {
		const { context } = props;
		props.setAttributes( context );
	}

	return (
		<Context.Consumer>
			{ ( { selectedTab, stripeNudge } ) => (
				/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
				// eslint-disable-next-line
				<div hidden={ selectedTab.id === 'wall' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks
						renderAppender={ ! props.hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
						templateLock={ false }
						template={ [
							[
								'core/paragraph',
								{
									placeholder: __(
										'Insert the piece of content you want your visitors to see after they subscribe.',
										'full-site-editing'
									),
								},
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
		return {
			// @ts-ignore difficult to type with JSDoc
			hasInnerBlocks: !! select( 'core/block-editor' ).getBlocksByClientId( props.clientId )[ 0 ]
				.innerBlocks.length,
			// @ts-ignore difficult to type with JSDoc
			containerClientId: select( 'core/block-editor' ).getBlockHierarchyRootClientId(
				props.clientId
			),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const blockEditor = dispatch( 'core/block-editor' );
		return {
			selectBlock() {
				// @ts-ignore difficult to type with JSDoc
				blockEditor.selectBlock( props.containerClientId );
			},
		};
	} ),
] )( Edit );
