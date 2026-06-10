import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export default function LegacyContact() {
	const translate = useTranslate();

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
