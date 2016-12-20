/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

const FeedError = React.createClass( {
	getDefaultProps() {
		return {
			message: i18n.translate( 'Sorry, we can\'t find that site.' )
		};
	},

	recordAction() {
		recordAction( 'clicked_search_on_404' );
		recordGaEvent( 'Clicked Search on 404' );
		recordTrack( 'calypso_reader_search_on_feed_error_clicked' );
	},

	recordSecondaryAction() {
		recordAction( 'clicked_discover_on_404' );
		recordGaEvent( 'Clicked Discover on 404' );
		recordTrack( 'calypso_reader_discover_on_feed_error_clicked' );
	},

	render() {
		const action = ( <a className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read/search">{ this.translate( 'Find Sites to Follow' ) }</a>),
			secondaryAction = (
				<a className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/discover">{ this.translate( 'Explore Discover' ) }</a> );

		return (
			<ReaderMain>
				<MobileBackToSidebar>
					<h1>{ this.props.sidebarTitle }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					action={ action }
					secondaryAction={ secondaryAction }
					title={ this.props.message }
					illustration={ '/calypso/images/drake/drake-404.svg' }
					illustrationWidth={ 500 }
				/>
			</ReaderMain>
		);
	}
} );

FeedError.propTypes = {
	sidebarTitle: React.PropTypes.string
};

export default FeedError;
