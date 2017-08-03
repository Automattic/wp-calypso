/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { some, partial, map, get } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import PostActions from 'lib/posts/actions';
import { generateGalleryShortcode } from 'lib/media/utils';
import markup from 'post-editor/media-modal/markup';
import { bumpStat } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

class EditorMediaModal extends Component {
	static propTypes = {
		site: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onClose: PropTypes.func
	};

	static defaultProps = {
		onInsertMedia: () => {},
		onClose: () => {}
	};

	insertMedia( { type, items, settings } ) {
		const { site } = this.props;
		let media, stat;

		const getItemMarkup = partial( markup.get, site );

		switch ( type ) {
			case 'gallery':
				if ( 'individual' === get( settings, 'type' ) ) {
					media = map( settings.items, getItemMarkup ).join( '' );
				} else {
					media = generateGalleryShortcode( settings );
				}

				stat = 'insert_gallery';
				break;

			case 'media':
			default:
				media = map( items, getItemMarkup ).join( '' );
				stat = 'insert_item';
		}

		if ( some( items, 'transient' ) ) {
			PostActions.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
		}

		if ( media ) {
			this.props.onInsertMedia( media );

			if ( stat ) {
				this.props.bumpStat( 'editor_media_actions', stat );
			}
		}

		this.props.onClose();
	}

	onClose = ( value ) => {
		if ( value ) {
			this.insertMedia( value );
		} else {
			this.props.onClose();
		}
	};

	render() {
		const { site } = this.props;

		return (
			<MediaLibrarySelectedData siteId={ get( site, 'ID' ) }>
				<MediaModal
					{ ...this.props }
					onClose={ this.onClose } />
			</MediaLibrarySelectedData>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state )
	} ),
	{ bumpStat }
)( EditorMediaModal );
