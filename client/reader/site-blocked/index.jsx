import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import MobileBackToSidebar from 'calypso/components/mobile-back-to-sidebar';
import ReaderMain from 'calypso/reader/components/reader-main';
import { recordTrack as recordReaderTrack } from 'calypso/reader/stats';
import { bumpStat, recordGoogleEvent } from 'calypso/state/analytics/actions';
import { unblockSite } from 'calypso/state/reader/site-blocks/actions';

class SiteBlocked extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	unblockSite = () => {
		this.props.bumpStat( 'reader_actions', 'unblocked_blog' );
		this.props.recordGoogleEvent( 'reader_actions', 'Clicked Unblock Site' );
		recordReaderTrack( 'calypso_reader_unblock_site', {
			blog_id: this.props.siteId,
		} );
		this.props.unblockSite( this.props.siteId );
	};

	render() {
		const { translate, title } = this.props;

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
					<h1>{ translate( 'Streams' ) }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					action={ action }
					title={ translate( 'You have blocked this site.' ) }
					line={ translate( "Unblock it if you'd like to see posts from {{em}}%s{{/em}} again.", {
						args: title,
						components: {
							em: <em />,
						},
						comment: '%s is a site name - for example, "Discover"',
					} ) }
					illustration={ '/calypso/images/illustrations/error.svg' }
					illustrationWidth={ 500 }
				/>
			</ReaderMain>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
	bumpStat,
	unblockSite,
} )( localize( SiteBlocked ) );
