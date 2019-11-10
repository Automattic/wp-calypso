/** @format */

/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import GMClosureNotice from '../shared/gm-closure-notice';
import FormattedHeader from 'components/formatted-header';
import ExternalLink from 'components/external-link';
import { localize } from 'i18n-calypso';
import { CONCIERGE_SUPPORT } from 'lib/url/support';

class PrimaryHeader extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Fragment>
				<GMClosureNotice
					displayAt="2019-09-03 00:00Z"
					closesAt="2019-09-10 00:00Z"
					reopensAt="2019-09-19 04:00Z"
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
