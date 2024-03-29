import { CALYPSO_CONTACT } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import DomainsLandingContentCard from '../content-card';
import DomainsLandingHeader from '../header';

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
				<DomainsLandingContentCard title={ title } message={ message } />
			</Fragment>
		);
	}
}

export default localize( InvalidActionPage );
