import { Card, ExternalLink } from '@automattic/components';
import { CONCIERGE_SUPPORT } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import ClosureNotice from '../shared/closure-notice';

class PrimaryHeader extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Fragment>
				<ClosureNotice
					displayAt="2023-12-26 00:00Z"
					closesAt="2023-12-31 00:00Z"
					reopensAt="2024-01-02 07:00Z"
					isGM={ false }
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
					<ExternalLink className="shared__info-link" href={ CONCIERGE_SUPPORT } target="_blank">
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</Card>
			</Fragment>
		);
	}
}

export default localize( PrimaryHeader );
