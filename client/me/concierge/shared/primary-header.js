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
					displayAt="2023-04-03 00:01Z"
					closesAt="2023-04-09 00:01Z"
					reopensAt="2023-04-10 07:00Z"
					holidayName="Easter"
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
