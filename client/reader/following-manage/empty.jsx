/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class FollowingManageEmptyContent extends React.Component {
	componentDidMount() {
		this.props.recordReaderTracksEvent( 'calypso_reader_empty_manage_following_loaded' );
	}

	recordAction = () => {
		recordAction( 'clicked_discover_on_empty_manage_following' );
		recordGaEvent( 'Clicked Discover on EmptyContent in Manage Following' );
		this.props.recordReaderTracksEvent(
			'calypso_reader_discover_on_empty_manage_following_clicked'
		);
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore' ) }
			</a>
		);

		return (
			<EmptyContent
				className="following-manage__empty"
				action={ action }
				title={ this.props.translate( "You haven't followed any sites yet" ) }
				line={ this.props.translate( 'Search for a site above or explore Discover.' ) }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 400 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( FollowingManageEmptyContent ) );
