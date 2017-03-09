/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	LinkQuit,
	Quit,
} from 'layout/guided-tours/config-elements';
import { hasUserPastedFromGoogleDocs } from 'state/ui/guided-tours/contexts';

export const GDocsIntegrationTour = makeTour(
	<Tour
		name="gdocsIntegrationTour"
		version="20170227"
		path="/post"
		when={ hasUserPastedFromGoogleDocs }
	>
		<Step name="init" placement="right">
			<p>{ translate( 'Do you want to post drafts directly from Google Docs?' ) }</p>
			<ButtonRow>
				<LinkQuit
					primary
					target="_blank"
					href="https://apps.wordpress.com/google-docs/">
					{ translate( 'Learn more' ) }
				</LinkQuit>
				<Quit>{ translate( 'No thanks' ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>

);
