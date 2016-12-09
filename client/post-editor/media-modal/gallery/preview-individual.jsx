/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import markup from '../markup';
import { getSelectedSite } from 'state/ui/selectors';

const EditorMediaModalGalleryPreviewIndividual = React.createClass( {
	propTypes: {
		items: PropTypes.arrayOf( PropTypes.object ),
		site: PropTypes.object
	},

	render() {
		const items = this.props.items.map( ( item ) => {
			const caption = markup.caption( this.props.site, item );

			if ( null === caption ) {
				return <div key={ item.ID } dangerouslySetInnerHTML={ { __html: markup.get( this.props.site, item ) } } />; //eslint-disable-line react/no-danger
			}

			return React.cloneElement( caption, { key: item.ID } );
		} );

		return (
			<div className="editor-media-modal-gallery__preview-individual">
				<div className="editor-media-modal-gallery__preview-individual-content">
					{ items }
				</div>
			</div>
		);
	}

} );

export default connect(
	state => {
		return {
			site: getSelectedSite( state )
		};
	}
)( EditorMediaModalGalleryPreviewIndividual );
