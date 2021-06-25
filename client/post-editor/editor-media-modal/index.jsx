/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { partial, map, get } from 'lodash';

/**
 * Internal dependencies
 */
import MediaModal from 'calypso/post-editor/media-modal';
import { generateGalleryShortcode } from 'calypso/lib/media/utils';
import markup from 'calypso/post-editor/media-modal/markup';
import { bumpStat } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

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
		let media;
		let stat;

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
		return <MediaModal { ...this.props } onClose={ this.onClose } />;
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} ),
	{
		bumpStat,
	}
)( EditorMediaModal );
