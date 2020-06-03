/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ClosureNotice from '../shared/closure-notice';
import FormattedHeader from 'components/formatted-header';
import ExternalLink from 'components/external-link';
import { easterHolidayName } from 'me/help/contact-form-notice/live-chat-closure';
import { localize } from 'i18n-calypso';
import { CONCIERGE_SUPPORT } from 'lib/url/support';

class PrimaryHeader extends Component {
	render() {
		const { isWhiteGlove, translate } = this.props;

		const headerText = isWhiteGlove
			? 'WordPress.com one-on-one session scheduler'
			: translate( 'WordPress.com Quick Start Session Scheduler' );

		return (
			<Fragment>
				<ClosureNotice
					displayAt="2020-04-09 00:00Z"
					closesAt="2020-04-12 06:00Z"
					reopensAt="2020-04-13 06:00Z"
					holidayName={ easterHolidayName }
				/>
				<Card>
					<img
						className="shared__info-illustration"
						alt="support session signup form header"
						src={ '/calypso/images/illustrations/illustration-start.svg' }
					/>
					<FormattedHeader
						headerText={ headerText }
						subHeaderText={ translate(
							'Use the tool below to book your in-depth support session.'
						) }
					/>
					<ExternalLink
						className="shared__info-link"
						icon={ false }
						href={ CONCIERGE_SUPPORT }
						target="_blank"
					>
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</Card>
			</Fragment>
		);
	}
}

export default localize( PrimaryHeader );
