/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Context from '../container/context';

function Edit( { hasInnerBlocks, parentClientId, isSelected } ) {
	const { selectBlock } = useDispatch( 'core/block-editor' );

	useEffect( () => {
		if ( isSelected ) {
			selectBlock( parentClientId );
		}
	}, [ selectBlock, isSelected, parentClientId ] );

	return (
		<Context.Consumer>
			{ ( { selectedTab, stripeNudge } ) => (
				/** @see https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/HEAD/docs/rules/no-static-element-interactions.md#case-the-event-handler-is-only-being-used-to-capture-bubbled-events */
				// eslint-disable-next-line
				<div hidden={ selectedTab.id === 'wall' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks
						renderAppender={ ! hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
						templateLock={ false }
						templateInsertUpdatesSelection={ false }
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
		const { getSelectedBlockClientId, getBlockHierarchyRootClientId } = select(
			'core/block-editor'
		);
		const selectedBlockClientId = getSelectedBlockClientId();
		return {
			parentClientId: getBlockHierarchyRootClientId( selectedBlockClientId ),
			// @ts-ignore difficult to type with JSDoc
			hasInnerBlocks: !! select( 'core/block-editor' ).getBlocksByClientId( props.clientId )[ 0 ]
				.innerBlocks.length,
		};
	} ),
] )( Edit );
