/**
 * WordPress dependencies
 */
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import storeHotSwapPlugin from '../../store/plugins/store-hot-swap';

function HotSwapper( { isEditing, hotSwap } ) {
	useEffect( () => {
		hotSwap( isEditing );
	}, [ isEditing ] );

	return null;
}

export default compose( [
	withSelect( ( select ) => {
		const { isEditing } = select( 'isolated/editor' );

		return {
			isEditing: isEditing(),
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		return {
			hotSwap: ( isEditing ) => {
				storeHotSwapPlugin.resetEditor();

				if ( isEditing ) {
					storeHotSwapPlugin.setEditor( select, dispatch );
				}
			},
		};
	} ),
] )( HotSwapper );
