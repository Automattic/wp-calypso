/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'client/components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'client/reader/stats';
import { isDiscoverEnabled } from 'client/reader/discover/helper';

class ListEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		recordTrack( 'calypso_reader_following_on_empty_list_stream_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_list_stream_clicked' );
	};

	render() {
		var action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/"
				>
					{ this.props.translate( 'Back to Following' ) }
				</a>
			),
			secondaryAction = isDiscoverEnabled() ? (
				<a
					className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/discover"
				>
					{ this.props.translate( 'Explore Discover' ) }
				</a>
			) : null;

		return (
			<EmptyContent
				title={ this.props.translate( 'No recent posts' ) }
				line={ this.props.translate( 'The sites in this list have not posted anything recently.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 400 }
			/>
		);
	}
}

export default localize( ListEmptyContent );
