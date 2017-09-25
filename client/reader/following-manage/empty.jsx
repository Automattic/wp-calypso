/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class FollowingManageEmptyContent extends React.Component {
	componentDidMount() {
		recordTrack( 'calypso_reader_empty_manage_following_loaded' );
	}

	recordAction = () => {
		recordAction( 'clicked_discover_on_empty_manage_following' );
		recordGaEvent( 'Clicked Discover on EmptyContent in Manage Following' );
		recordTrack( 'calypso_reader_discover_on_empty_manage_following_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore Discover' ) }
			</a>
		);

		return (
			<EmptyContent
				className="is-drake"
				action={ action }
				title={ this.props.translate( "You haven't followed any sites yet" ) }
				line={ this.props.translate( 'Search for a site above or explore Discover.' ) }
				illustration={ '/calypso/images/drake/drake-all-done.svg' }
				illustrationWidth={ 500 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( FollowingManageEmptyContent );
