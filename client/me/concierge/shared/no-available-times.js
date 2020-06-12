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
import { recordTracksEvent } from 'state/analytics/actions';
import isSiteWhiteGlove from 'state/selectors/is-site-white-glove';
import ExternalLinkWithTracking from 'components/external-link/with-tracking';
import { stubFalse } from 'lodash';

class NoAvailableTimes extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_concierge_no_available_times' );
	}

	render() {
		const { isWhiteGlove, translate } = this.props;

		return (
			<div>
				<PrimaryHeader isWhiteGlove={ isWhiteGlove } />
				<Card>
					<h2 className="shared__no-available-times-heading">
						{ translate( 'Sorry, all upcoming sessions are full' ) }
					</h2>
					{ isWhiteGlove && (
						<>
							We add new sessions daily, so please check back soon for more options. In the
							meantime, consider attending one of our expert webinars on a wide variety of topics
							designed to help you build and grow your site.{ ' ' }
							<ExternalLinkWithTracking
								icon={ false }
								href="https://wordpress.com/webinars/"
								onClick={ () => {} }
								tracksEventName="calypso_concierge_book_view_webinars"
							>
								{ translate( 'View webinars.' ) }
							</ExternalLinkWithTracking>
							or
							<ExternalLinkWithTracking
								icon={ false }
								href="https://wordpress.com/help/contact"
								onClick={ () => {} }
								tracksEventName="calypso_concierge_book_view_contact_us"
							>
								contact us in Live Chat
							</ExternalLinkWithTracking>
							.
						</>
					) }
					{ ! isWhiteGlove && (
						<>
							{ translate(
								'We add new sessions daily, so please check back soon for more options. In the meantime, consider attending one of our expert webinars on a wide variety of topics designed to help you build and grow your site.'
							) }{ ' ' }
							<ExternalLinkWithTracking
								icon={ false }
								href="https://wordpress.com/webinars/"
								onClick={ () => {} }
								tracksEventName="calypso_concierge_book_view_webinars"
							>
								{ translate( 'View webinars.' ) }
							</ExternalLinkWithTracking>
							{ translate( ' or ' ) }
							<ExternalLinkWithTracking
								icon={ false }
								href="https://wordpress.com/help/contact"
								onClick={ () => {} }
								tracksEventName="calypso_concierge_book_contact_us"
							>
								{ translate( 'contact us in Live Chat' ) }
							</ExternalLinkWithTracking>
							.
						</>
					) }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( { isWhiteGlove: isSiteWhiteGlove( state, ownProps.site.ID ) } ),
	{ recordTracksEvent }
)( localize( NoAvailableTimes ) );
