/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import EmptyContent from 'components/empty-content';
//import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

class SiteBlockedError extends React.Component {
	unblockSite = () => {
		// recordAction( 'clicked_search_on_404' );
		// recordGaEvent( 'Clicked Search on 404' );
		// recordTrack( 'calypso_reader_search_on_feed_error_clicked' );
	};

	render() {
		const { translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<button className="empty-content__action button is-primary" onClick={ this.unblockSite }>
				{ this.props.translate( 'Unblock' ) }
			</button>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */

		return (
			<ReaderMain>
				<MobileBackToSidebar>
					<h1>{ translate( 'Site blocked' ) }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					action={ action }
					title={ translate( 'You have blocked this site.' ) }
					illustration={ '/calypso/images/illustrations/illustration-ok.svg' }
					illustrationWidth={ 500 }
				/>
			</ReaderMain>
		);
	}
}

export default localize( SiteBlockedError );
