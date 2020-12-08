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

function Edit( { parentClientId, isSelected } ) {
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
				<div hidden={ selectedTab.id === 'premium' } className={ selectedTab.className }>
					{ stripeNudge }
					<InnerBlocks
						templateLock={ false }
						templateInsertUpdatesSelection={ false }
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
							[ 'premium-content/buttons' ],
						] }
					/>
				</div>
			) }
		</Context.Consumer>
	);
}

export default compose(
	withSelect( ( select ) => {
		const { getSelectedBlockClientId, getBlockHierarchyRootClientId } = select(
			'core/block-editor'
		);
		const selectedBlockClientId = getSelectedBlockClientId();
		return {
			parentClientId: getBlockHierarchyRootClientId( selectedBlockClientId ),
		};
	} )
)( Edit );
