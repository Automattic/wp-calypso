/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';
import { isDiscoverEnabled } from 'calypso/reader/discover/helper';

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
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read"
			>
				{ this.props.translate( 'Back to Following' ) }
			</a>
		);
		const secondaryAction = isDiscoverEnabled() ? (
			<a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore' ) }
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
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ListEmptyContent );
