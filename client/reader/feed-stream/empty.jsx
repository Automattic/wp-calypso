/**
 * External Dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';

class FeedEmptyContent extends React.PureComponent {
	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_feed_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_feed_clicked' );
	};

	render() {
		const translate = this.props.translate;
		const action = (
			<a
				className="empty-content__action button is-primary" //eslint-disable-line
				onClick={ this.recordAction }
				href="/read/search"
			>
				{ translate( 'Find sites to follow' ) }
			</a>
		);
		const secondaryAction = (
			<a
				className="empty-content__action button" //eslint-disable-line
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ translate( 'Explore' ) }
			</a>
		);

		return (
			<EmptyContent
				title={ translate( 'No recent posts' ) }
				line={ translate( 'This site has not posted anything recently.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 500 }
			/>
		);
	}
}

export default localize( FeedEmptyContent );
