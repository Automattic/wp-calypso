/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import i18n, { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderMain from 'calypso/reader/components/reader-main';
import MobileBackToSidebar from 'calypso/components/mobile-back-to-sidebar';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class FeedError extends React.Component {
	static defaultProps = {
		message: i18n.translate( "Sorry, we can't find that site." ),
	};

	recordAction = () => {
		recordAction( 'clicked_search_on_404' );
		recordGaEvent( 'Clicked Search on 404' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_on_feed_error_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_404' );
		recordGaEvent( 'Clicked Discover on 404' );
		this.props.recordReaderTracksEvent( 'calypso_reader_discover_on_feed_error_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read/search"
			>
				{ this.props.translate( 'Find sites to follow' ) }
			</a>
		);
		const secondaryAction = (
			<a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore' ) }
			</a>
		);

		return (
			<ReaderMain>
				<MobileBackToSidebar>
					<h1>{ this.props.sidebarTitle }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					action={ action }
					secondaryAction={ secondaryAction }
					title={ this.props.message }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					illustrationWidth={ 500 }
				/>
			</ReaderMain>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

FeedError.propTypes = {
	sidebarTitle: PropTypes.string,
};

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( FeedError ) );
