/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DisconnectSurvey from './disconnect-survey';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import NavigationLink from 'calypso/components/wizard/navigation-link';
import Troubleshoot from './troubleshoot';
import { useTranslate } from 'i18n-calypso';

export default function SurveyFlow( { confirmHref, backHref } ) {
	const translate = useTranslate();

	return (
		<Main className="disconnect-site__site-settings">
			<DocumentHead title={ translate( 'Site Settings' ) } />
			<FormattedHeader
				headerText={ translate( 'Disable Jetpack' ) }
				subHeaderText={ translate( "Please let us know why you're disabling Jetpack." ) }
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
