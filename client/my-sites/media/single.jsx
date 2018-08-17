/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSite } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { EditorMediaModalDetail } from 'post-editor/media-modal/detail';

class SingleMediaComponent extends Component {
	static propTypes = {
		selectedSite: PropTypes.object,
	};

	state = {
		currentDetail: null,
		editedImageItem: null,
		editedVideoItem: null,
		selectedItems: [],
		source: '',
	};

	// componentDidMount() {
	// }
	//
	// componentDidUpdate( prevProps ) {
	// }

	render() {
		const selectedItems = [
			{
				ID: 78,
				URL: 'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg',
				guid: 'http://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg',
				date: '2014-10-08T22:24:21+00:00',
				post_ID: 63,
				author_ID: 743971,
				file: 'tumblr_m3pm45zc4v1qjahcpo1_500.jpg',
				mime_type: 'image/jpeg',
				extension: 'jpg',
				title: 'tumblr_m3pm45zC4v1qjahcpo1_500',
				caption: '',
				description: '',
				alt: '',
				icon: 'https://s1.wp.com/wp-includes/images/media/default.png',
				thumbnails: {
					thumbnail:
						'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg?w=107',
					medium:
						'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg?w=215',
					large:
						'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg?w=450',
					'small-business-single-image':
						'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg?w=450',
					'jetpack-portfolio-admin-thumb':
						'https://enejtest.files.wordpress.com/2014/10/tumblr_m3pm45zc4v1qjahcpo1_500.jpg?w=50&h=50&crop=1',
				},
				height: 629,
				width: 450,
				exif: {
					aperture: 0,
					credit: '',
					camera: '',
					caption: '',
					created_timestamp: 0,
					copyright: '',
					focal_length: 0,
					iso: 0,
					shutter_speed: 0,
					title: '',
					orientation: 0,
				},
				meta: {
					links: {
						self: 'https://public-api.wordpress.com/rest/v1.1/sites/68682177/media/78',
						help: 'https://public-api.wordpress.com/rest/v1.1/sites/68682177/media/78/help',
						site: 'https://public-api.wordpress.com/rest/v1.1/sites/68682177',
						parent: 'https://public-api.wordpress.com/rest/v1.1/sites/68682177/posts/63',
					},
				},
			},
		];
		return (
			<Main wideLayout>
				<PageViewTracker path="/media/:site/:attachment" title="Media > Attachment" />
				<DocumentHead title="HOWDY" />
				<div className="media__wrapper">
					<EditorMediaModalDetail
						site={ this.props.selectedSite }
						items={ selectedItems }
						selectedIndex={ 0 }
						onReturnToList={ this.closeDetailsModal }
						onEditImageItem={ this.editImage }
						onEditVideoItem={ this.editVideo }
						onRestoreItem={ this.restoreOriginalMedia }
						onSelectedIndexChange={ this.setDetailSelectedIndex }
					/>
				</div>
			</Main>
		);
	}
}

const mapStateToProps = state => ( {
	selectedSite: getSelectedSite( state ),
} );

export default connect( mapStateToProps )( localize( SingleMediaComponent ) );
