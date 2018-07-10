/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import BlockSwitcher from './';

export function MultiBlocksSwitcher( { isMultiBlockSelection, selectedBlockUids } ) {
	if ( ! isMultiBlockSelection ) {
		return null;
	}
	return (
		<BlockSwitcher key="switcher" uids={ selectedBlockUids } />
	);
}

export default withSelect(
	( select ) => {
		const selectedBlockUids = select( 'core/editor' ).getMultiSelectedBlockUids();
		return {
			isMultiBlockSelection: selectedBlockUids.length > 1,
			selectedBlockUids,
		};
	}
)( MultiBlocksSwitcher );
