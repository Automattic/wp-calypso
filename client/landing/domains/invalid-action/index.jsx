/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import EmptyContent from 'components/empty-content';
import DomainsLandingHeader from '../header';
import { CALYPSO_CONTACT } from 'lib/url/support';

class InvalidActionPage extends Component {
	render() {
		const { translate } = this.props;
		const title = translate( 'Uh oh. Page not found.' );
		const message = translate(
			"If you've arrived here after clicking a link from a WordPress.com email, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.",
			{
				components: {
					a: <a href={ CALYPSO_CONTACT } />,
					strong: <strong />,
				},
			}
		);
		return (
			<Fragment>
				<DomainsLandingHeader />
				<CompactCard>
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-404.svg"
						title={ title }
						line={ message }
						action="Return Home"
						actionURL="/"
					/>
				</CompactCard>
			</Fragment>
		);
	}
}

export default localize( InvalidActionPage );
