/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryMedia from 'components/data/query-media';
import getMediaItem from 'state/selectors/get-media-item';
import SidebarNavigation from 'my-sites/sidebar-navigation';

import { getSelectedSite } from 'state/ui/selectors';
import MediaDetails from 'my-sites/media/details';

class SingleMedia extends Component {
	static propTypes = {
		selectedSite: PropTypes.object,
		mediaId: PropTypes.number,
		media: PropTypes.object,
		view: PropTypes.string,
	};

	onBack = () => {
		page( '/media/' + this.props.selectedSite.slug );
		return;
	};

	render() {
		return (
			<div className="main main-column media" role="main">
				<SidebarNavigation />
				{ this.props.selectedSite &&
					this.props.selectedSite.ID && (
						<QueryMedia siteId={ this.props.selectedSite.ID } mediaId={ this.props.attachmentID } />
					) }
				<PageViewTracker path="/media/:site/:attachment" title="Media > Attachment" />
				<DocumentHead title="HOWDY" />
				<MediaDetails
					site={ this.props.selectedSite }
					items={ [ this.props.media ] }
					selected={ 0 }
					view={ this.props.view }
					onBack={ this.onBack }
				/>
			</div>
		);
	}
}

const mapStateToProps = ( state, { mediaId } ) => {
	const selectedSite = getSelectedSite( state );
	return {
		selectedSite,
		media:
			mediaId && selectedSite && selectedSite.ID
				? getMediaItem( state, selectedSite.ID, mediaId )
				: null,
	};
};

export default connect( mapStateToProps )( SingleMedia );
