/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { isDiscoverEnabled } from 'reader/discover/helper';

class TagEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty_likes' );
		recordGaEvent( 'Clicked Following on Empty Like Stream' );
		recordTrack( 'calypso_reader_following_on_empty_like_stream_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty_likes' );
		recordGaEvent( 'Clicked Discover on Empty Like Stream' );
		recordTrack( 'calypso_reader_discover_on_empty_like_stream_clicked' );
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
				title={ this.props.translate( 'No Likes Yet' ) }
				line={ this.props.translate( 'Posts that you like will appear here.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 400 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( TagEmptyContent );
