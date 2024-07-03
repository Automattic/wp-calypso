import PropTypes from 'prop-types';
import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import markup from '../markup';

class EditorMediaModalGalleryPreviewIndividual extends Component {
	static propTypes = {
		items: PropTypes.arrayOf( PropTypes.object ),
		site: PropTypes.object,
	};

	render() {
		const items = this.props.items.map( ( item ) => {
			const caption = markup.caption( this.props.site, item );

			if ( null === caption ) {
				return (
					<div
						key={ item.ID }
						/* eslint-disable-next-line */
						dangerouslySetInnerHTML={ { __html: markup.get( this.props.site, item ) } }
					/>
				);
			}

			return cloneElement( caption, { key: item.ID } );
		} );

		return (
			<div className="editor-media-modal-gallery__preview-individual">
				<div className="editor-media-modal-gallery__preview-individual-content">{ items }</div>
			</div>
		);
	}
}

export default connect( ( state ) => {
	return {
		site: getSelectedSite( state ),
	};
} )( EditorMediaModalGalleryPreviewIndividual );
