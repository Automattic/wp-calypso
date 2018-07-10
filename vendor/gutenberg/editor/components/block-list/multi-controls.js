/**
 * External dependencies
 */
import { first, last } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import BlockMover from '../block-mover';
import BlockSettingsMenu from '../block-settings-menu';

function BlockListMultiControls( { multiSelectedBlockUids, rootUID, isSelecting, isFirst, isLast } ) {
	if ( isSelecting ) {
		return null;
	}

	return [
		<BlockMover
			key="mover"
			rootUID={ rootUID }
			uids={ multiSelectedBlockUids }
			isFirst={ isFirst }
			isLast={ isLast }
		/>,
		<BlockSettingsMenu
			key="menu"
			rootUID={ rootUID }
			uids={ multiSelectedBlockUids }
			focus
		/>,
	];
}

export default withSelect( ( select, { rootUID } ) => {
	const {
		getMultiSelectedBlockUids,
		isMultiSelecting,
		getBlockIndex,
		getBlockCount,
	} = select( 'core/editor' );
	const uids = getMultiSelectedBlockUids();
	const firstIndex = getBlockIndex( first( uids ), rootUID );
	const lastIndex = getBlockIndex( last( uids ), rootUID );

	return {
		multiSelectedBlockUids: uids,
		isSelecting: isMultiSelecting(),
		isFirst: firstIndex === 0,
		isLast: lastIndex + 1 === getBlockCount(),
	};
} )( BlockListMultiControls );
