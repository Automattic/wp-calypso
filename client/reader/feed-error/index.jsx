/** @format */
/**
 * External dependencies
 */
import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import ReaderMain from 'components/reader-main';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class FeedError extends React.Component {
	static defaultProps = {
		message: i18n.translate( "Sorry, we can't find that site." ),
	};

	recordAction = () => {
		recordAction( 'clicked_search_on_404' );
		recordGaEvent( 'Clicked Search on 404' );
		recordTrack( 'calypso_reader_search_on_feed_error_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_404' );
		recordGaEvent( 'Clicked Discover on 404' );
		recordTrack( 'calypso_reader_discover_on_feed_error_clicked' );
	};

	render() {
		const action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/read/search"
				>
					{ this.props.translate( 'Find Sites to Follow' ) }
				</a>
			),
			secondaryAction = (
				<a
					className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/discover"
				>
					{ this.props.translate( 'Explore Discover' ) }
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
	}
}

FeedError.propTypes = {
	sidebarTitle: PropTypes.string,
};

export default localize( FeedError );
