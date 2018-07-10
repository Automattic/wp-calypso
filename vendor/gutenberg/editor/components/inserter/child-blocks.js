/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { ifCondition } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockTypesList from '../block-types-list';
import BlockIcon from '../block-icon';

function ChildBlocks( { rootBlockIcon, rootBlockTitle, items, ...props } ) {
	return (
		<div className="editor-inserter__child-blocks">
			{ ( rootBlockIcon || rootBlockTitle ) && (
				<div className="editor-inserter__parent-block-header">
					<BlockIcon icon={ rootBlockIcon } showColors />
					{ rootBlockTitle && <h2>{ rootBlockTitle }</h2> }
				</div>
			) }
			<BlockTypesList items={ items } { ...props } />
		</div>
	);
}

export default compose(
	ifCondition( ( { items } ) => items && items.length > 0 ),
	withSelect( ( select, { rootUID } ) => {
		const {
			getBlockType,
		} = select( 'core/blocks' );
		const {
			getBlockName,
		} = select( 'core/editor' );
		const rootBlockName = getBlockName( rootUID );
		const rootBlockType = getBlockType( rootBlockName );
		return {
			rootBlockTitle: rootBlockType && rootBlockType.title,
			rootBlockIcon: rootBlockType && rootBlockType.icon,
		};
	} ),
)( ChildBlocks );
