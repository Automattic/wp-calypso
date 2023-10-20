import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import NavigationLink from 'calypso/components/wizard/navigation-link';
import DisconnectSurvey from './disconnect-survey';
import Troubleshoot from './troubleshoot';

export default function SurveyFlow( { confirmHref, backHref } ) {
	const translate = useTranslate();

	return (
		<Main className="disconnect-site__site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<NavigationHeader
				navigationItems={ [] }
				title={ translate( 'Disable Jetpack' ) }
				subtitle={ translate( "Please let us know why you're disabling Jetpack." ) }
			/>
			<DisconnectSurvey confirmHref={ confirmHref } />
			<div className="disconnect-site__navigation-links">
				<NavigationLink href={ backHref } direction="back" />
				<NavigationLink href={ confirmHref } direction="forward" />
			</div>
			<Troubleshoot />
		</Main>
	);
}
