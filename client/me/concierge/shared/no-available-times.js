import { Card, ExternalLinkWithTracking } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PrimaryHeader from './primary-header';

class NoAvailableTimes extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_no_available_times' );
	}

	render() {
		const { translate, isUserBlocked } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<Card>
					<h2 className="shared__no-available-times-heading">
						{ translate( 'Sorry, all upcoming sessions are full.' ) }
					</h2>
					{ isUserBlocked &&
						translate(
							'We add new sessions daily, so please check back soon for more options. In the meantime, consider attending one of our expert webinars on a wide variety of topics designed to help you build and grow your site. {{externalLink1}}View webinars{{/externalLink1}}.',
							{
								components: {
									externalLink1: (
										<ExternalLinkWithTracking
											href="/webinars"
											tracksEventName="calypso_concierge_book_view_webinars"
										/>
									),
								},
							}
						) }
					{ ! isUserBlocked &&
						translate(
							'We add new sessions daily, so please check back soon for more options. In the meantime, consider attending one of our expert webinars on a wide variety of topics designed to help you build and grow your site. {{externalLink1}}View webinars{{/externalLink1}} or {{externalLink2}}contact us in Live Chat{{/externalLink2}}.',
							{
								components: {
									externalLink1: (
										<ExternalLinkWithTracking
											href="/webinars"
											tracksEventName="calypso_concierge_book_view_webinars"
										/>
									),
									externalLink2: (
										<ExternalLinkWithTracking
											href="/help/contact"
											tracksEventName="calypso_concierge_book_contact_us"
										/>
									),
								},
							}
						) }
				</Card>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( NoAvailableTimes ) );
