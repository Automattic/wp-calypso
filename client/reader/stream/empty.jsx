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

/**
 * Image dependencies
 */
import welcomeImage from 'assets/images/reader/reader-welcome-illustration.svg';

class FollowingEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_stream_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/read/search"
				>
					{ this.props.translate( 'Find Sites to Follow' ) }
				</a>
			),
			secondaryAction = null;

		return (
			<EmptyContent
				className="stream__empty"
				title={ this.props.translate( 'Welcome to Reader' ) }
				line={ this.props.translate( 'Recent posts from sites you follow will appear here.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ welcomeImage }
				illustrationWidth={ 350 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( FollowingEmptyContent );
