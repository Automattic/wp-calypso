/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import { ButtonRow, makeTour, Quit, Link, Step, Tour } from 'layout/guided-tours/config-elements';
import { localizeUrl } from 'lib/i18n-utils';

const CONNECT_BUTTON_SELECTOR = '.sharing-service.not-connected .button.is-compact';

// Wait until the desired DOM element appears. Check every 125ms.
// This function is a Redux action creator, hence the two arrows.
const waitForConnectButton = () => async () => {
	while ( ! document.querySelector( CONNECT_BUTTON_SELECTOR ) ) {
		await new Promise( ( resolve ) => setTimeout( resolve, 125 ) );
	}
};

export const marketingConnectionsTour = makeTour(
	<Tour { ...meta }>
		<Step
			arrow="right-middle"
			name="init"
			placement="beside"
			style={ {
				marginLeft: '-24px',
			} }
			wait={ waitForConnectButton }
			target={ CONNECT_BUTTON_SELECTOR }
			keepRepositioning={ true }
		>
			{ ( { translate } ) => (
				<>
					<p>
						{ translate(
							"Select the service which you'd like to connect. " +
								'Whenever you publish a new post, your social media followers will receive an update.'
						) }
					</p>
					<ButtonRow>
						<Link
							supportArticleId={ 4789 }
							href={ localizeUrl( 'https://wordpress.com/support/publicize/' ) }
						>
							{ translate( 'Learn more' ) }
						</Link>
						<Quit primary>{ translate( 'Got it' ) }</Quit>
					</ButtonRow>
				</>
			) }
		</Step>
	</Tour>
);
