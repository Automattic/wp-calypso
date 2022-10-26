import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import ExternalLink from 'calypso/components/external-link';
import FormattedHeader from 'calypso/components/formatted-header';
import { CONCIERGE_SUPPORT } from 'calypso/lib/url/support';
import ClosureNotice from '../shared/closure-notice';

class PrimaryHeader extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Fragment>
				<ClosureNotice
					displayAt="2022-04-10 00:00Z"
					closesAt="2022-04-17 00:00Z"
					reopensAt="2022-04-18 07:00Z"
					holidayName={ translate( 'Easter', {
						context: 'Holiday name',
					} ) }
				/>
				<ClosureNotice
					displayAt="2022-10-29 00:00Z"
					closesAt="2022-11-05 00:00Z"
					reopensAt="2022-11-14 07:00Z"
					holidayName={ translate( 'annual company meetup' ) }
				/>
				<ClosureNotice
					displayAt="2022-12-17 00:00Z"
					closesAt="2022-12-24 00:00Z"
					reopensAt="2022-12-26 07:00Z"
					holidayName={ translate( 'Christmas', {
						context: 'Holiday name',
					} ) }
				/>
				<ClosureNotice
					displayAt="2022-12-26 07:00Z"
					closesAt="2022-12-31 00:00Z"
					reopensAt="2023-01-02 07:00Z"
					holidayName={ translate( "New Year's Day", {
						context: 'Holiday name',
					} ) }
				/>
				<Card>
					<img
						className="shared__info-illustration"
						alt="support session signup form header"
						src="/calypso/images/illustrations/illustration-start.svg"
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
