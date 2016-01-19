/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import markup from '../markup';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryPreviewIndividual',

	propTypes: {
		items: PropTypes.arrayOf( PropTypes.object )
	},

	render() {
		const items = this.props.items.map( ( item ) => {
			const caption = markup.caption( item );

			if ( null === caption ) {
				return <div key={ item.ID } dangerouslySetInnerHTML={ { __html: markup.get( item ) } } />; //eslint-disable-line react/no-danger
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
