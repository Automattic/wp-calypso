/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import PrimaryHeader from './primary-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';

class NoAvailableTimes extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_no_available_times' );
	}

	render() {
		const { translate } = this.props;
		return (
			<div>
				<PrimaryHeader />
				<Card>
					<h2 className="shared__no-available-times-heading">
						{ translate( 'Sorry, all upcoming sessions are full.' ) }
					</h2>
					{ translate(
						'We add new sessions daily, so please check back soon for more options. In the meantime, consider attending one of our expert webinars on a wide variety of topics designed to help you build and grow your site. {{externalLink1}}View webinars{{/externalLink1}} or {{externalLink2}}contact us in Live Chat{{/externalLink2}}.',
						{
							components: {
								externalLink1: (
									<ExternalLinkWithTracking
										icon={ false }
										href="/webinars"
										tracksEventName="calypso_concierge_book_view_webinars"
									/>
								),
								externalLink2: (
									<ExternalLinkWithTracking
										icon={ false }
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
