/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ClosureNotice from '../shared/closure-notice';
import FormattedHeader from 'calypso/components/formatted-header';
import ExternalLink from 'calypso/components/external-link';
import { localize } from 'i18n-calypso';
import { CONCIERGE_SUPPORT } from 'calypso/lib/url/support';

class PrimaryHeader extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Fragment>
				<ClosureNotice
					displayAt="2020-12-17 00:00Z"
					closesAt="2020-12-24 00:00Z"
					reopensAt="2020-12-26 07:00Z"
					holidayName="Christmas"
				/>
				<ClosureNotice
					displayAt="2020-12-26 07:00Z"
					closesAt="2020-12-31 00:00Z"
					reopensAt="2021-01-02 07:00Z"
					holidayName="New Year's Day"
				/>
				<Card>
					<img
						className="shared__info-illustration"
						alt="support session signup form header"
						src={ '/calypso/images/illustrations/illustration-start.svg' }
					/>
					<FormattedHeader
						headerText={ translate( 'WordPress.com Quick Start Session Scheduler' ) }
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
