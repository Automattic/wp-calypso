/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	LinkQuit,
	Quit,
} from 'layout/guided-tours/config-elements';
import { recordTracksEvent } from 'lib/analytics/tracks';

const trackUserInterest = () => {
	recordTracksEvent( 'calypso_editor_gdocs_tour_success' );
};

export const GDocsIntegrationTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" placement="right" style={ { animationDelay: '2s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Did you know you can create drafts from Google Docs?' ) }</p>
					<ButtonRow>
						<LinkQuit
							primary
							target="_blank"
							onClick={ trackUserInterest }
							href="https://apps.wordpress.com/google-docs/"
						>
							{ translate( 'Learn more' ) }
						</LinkQuit>
						<Quit>{ translate( 'No thanks' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
