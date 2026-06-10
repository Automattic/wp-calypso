import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

class LegacyContact extends Component {
	render() {
		const { translate } = this.props;

		return (
			<Main wideLayout className="legacy-contact">
				<PageViewTracker path="/me/legacy-contact" title="Me > Legacy Contact" />
				<DocumentHead title={ translate( 'Legacy Contact' ) } />
				<NavigationHeader navigationItems={ [] } title={ translate( 'Legacy Contact' ) } />

				<Card className="legacy-contact__intro">
					<p>
						{ translate(
							'A legacy contact is someone you trust to have access to your account after your death.'
						) }
					</p>
				</Card>
			</Main>
		);
	}
}

export default localize( LegacyContact );
