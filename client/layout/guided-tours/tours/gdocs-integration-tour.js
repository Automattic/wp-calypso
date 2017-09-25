/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { makeTour, Tour, Step, ButtonRow, LinkQuit, Quit } from 'layout/guided-tours/config-elements';
import analytics from 'lib/analytics';
import { hasUserPastedFromGoogleDocs } from 'state/ui/guided-tours/contexts';

const trackUserInterest = () => {
	analytics.tracks.recordEvent( 'calypso_editor_gdocs_tour_success' );
};

export const GDocsIntegrationTour = makeTour(
	<Tour
		name="gdocsIntegrationTour"
		version="20170227"
		path="/post"
		when={ hasUserPastedFromGoogleDocs }
	>
		<Step name="init" placement="right">
			<p>{ translate( 'Did you know you can create drafts from Google Docs?' ) }</p>
			<ButtonRow>
				<LinkQuit
					primary
					target="_blank"
					onClick={ trackUserInterest }
					href="https://apps.wordpress.com/google-docs/">
					{ translate( 'Learn more' ) }
				</LinkQuit>
				<Quit>{ translate( 'No thanks' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
