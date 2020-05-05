/**
 * External dependencies
 */
import Gridicon from 'components/gridicon';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import PluginsStore from 'lib/plugins/store';
import { getSelectedSite } from 'state/ui/selectors';
import {
	ButtonRow,
	Continue,
	makeTour,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

const JETPACK_TOGGLE_SELECTOR = '.plugin-item-jetpack .form-toggle__switch';

// Wait until the desired DOM element appears. Check every 125ms.
// This function is a Redux action creator, hence the two arrows.
const waitForJetpackToggle = () => async () => {
	while ( ! document.querySelector( JETPACK_TOGGLE_SELECTOR ) ) {
		await new Promise( ( resolve ) => setTimeout( resolve, 125 ) );
	}
};

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const JetpackPluginUpdatesTour = makeTour(
	<Tour
		{ ...meta }
		when={ ( state ) => {
			const site = getSelectedSite( state );
			const res =
				! PluginsStore.isFetchingSite( site ) && !! PluginsStore.getSitePlugin( site, 'jetpack' );
			return res;
		} }
	>
		<Step
			name="init"
			target={ JETPACK_TOGGLE_SELECTOR }
			arrow="top-left"
			placement="below"
			wait={ waitForJetpackToggle }
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"Let's activate autoupdates for Jetpack to ensure you're always " +
								'up to date with the latest features and security fixes.'
						) }
					</p>
					<ButtonRow>
						<Continue
							target=".plugin-item-jetpack .form-toggle__switch"
							step="finish"
							click
							hidden
						/>
						<SiteLink href="/plans/my-plan/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<h1 className="tours__title">
						<span className="tours__completed-icon-wrapper">
							<Gridicon icon="checkmark" className="tours__completed-icon" />
						</span>
						{ translate( 'Excellent, you’re done!' ) }
					</h1>
					<p>
						{ translate(
							'Jetpack will now autoupdate for you. Would you like to continue setting up the security essential features for your site?'
						) }
					</p>
					<ButtonRow>
						<SiteLink isButton href="/plans/my-plan/:site">
							{ translate( "Yes, let's do it." ) }
						</SiteLink>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
