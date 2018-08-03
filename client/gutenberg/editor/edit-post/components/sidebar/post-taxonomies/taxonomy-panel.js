/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { PanelBody } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

function TaxonomyPanel( { taxonomy, isOpened, onTogglePanel, children } ) {
	const taxonomyMenuName = get( taxonomy, [ 'labels', 'menu_name' ] );
	if ( ! taxonomyMenuName ) {
		return null;
	}
	return (
		<PanelBody
			title={ taxonomyMenuName }
			opened={ isOpened }
			onToggle={ onTogglePanel }
		>
			{ children }
		</PanelBody>
	);
}

export default compose(
	withSelect( ( select, ownProps ) => {
		const slug = get( ownProps.taxonomy, [ 'slug' ] );
		const panelName = slug ? `taxonomy-panel-${ slug }` : '';
		return {
			panelName,
			isOpened: slug ?
				select( 'core/edit-post' ).isEditorSidebarPanelOpened( panelName ) :
				false,
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => ( {
		onTogglePanel: () => {
			dispatch( 'core/edit-post' ).
				toggleGeneralSidebarEditorPanel( ownProps.panelName );
		},
	} ) ),
)( TaxonomyPanel );
