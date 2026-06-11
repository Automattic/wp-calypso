import { legacyContactsQuery } from '@automattic/api-queries';
import { Button, Card } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

import './style.scss';

export default function LegacyContact() {
	const translate = useTranslate();

	const { data: [ contact ] = [], isLoading } = useQuery( legacyContactsQuery() );

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

				{ ! isLoading &&
					( contact ? (
						<p>
							{ translate( 'Your legacy contact is {{strong}}%(email)s{{/strong}}.', {
								args: { email: contact.email },
								components: { strong: <strong /> },
							} ) }
						</p>
					) : (
						<Button
							className="legacy-contact__action"
							primary
							onClick={ () => {
								// TODO: open the legacy contact setup flow.
							} }
						>
							{ translate( 'Set up legacy contact' ) }
						</Button>
					) ) }
			</Card>
		</Main>
	);
}
