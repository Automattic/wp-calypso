/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { some, partial, map, get } from 'lodash';

/**
 * Internal dependencies
 */
import MediaLibrarySelectedData from 'components/data/media-library-selected-data';
import MediaModal from 'post-editor/media-modal';
import { generateGalleryShortcode } from 'lib/media/utils';
import markup from 'post-editor/media-modal/markup';
import { bumpStat } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { blockSave } from 'state/ui/editor/save-blockers/actions';

class EditorMediaModal extends Component {
	static propTypes = {
		site: PropTypes.object,
		onInsertMedia: PropTypes.func,
		onClose: PropTypes.func,
		isGutenberg: PropTypes.bool,
	};

	static defaultProps = {
		onInsertMedia: () => {},
		onClose: () => {},
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
			this.props.blockSave( 'MEDIA_MODAL_TRANSIENT_INSERT' );
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
			// `isGutenberg` means that the Media Modal has been opened by a Gutenberg media block,
			// as opposed to the Classic editor or the Classic block in Gutenberg.
			// This is needed because `insertMedia` returns the media markup, used by TinyMCE,
			// while `onClose` returns the media object, used by Gutenberg media blocks.
			return this.props.isGutenberg ? this.props.onClose( value ) : this.insertMedia( value );
		}
		this.props.onClose();
	};

	render() {
		const { site } = this.props;

		return (
			<MediaLibrarySelectedData siteId={ get( site, 'ID' ) }>
				<MediaModal { ...this.props } onClose={ this.onClose } />
			</MediaLibrarySelectedData>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} ),
	{
		blockSave,
		bumpStat,
	}
)( EditorMediaModal );
