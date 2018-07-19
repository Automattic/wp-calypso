/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	makeTour,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import PluginsStore from 'lib/plugins/store';
import { getSelectedSite } from 'state/ui/selectors';
import { query } from 'layout/guided-tours/positioning';

window.pstore = PluginsStore;

export const JetpackPluginUpdatesTour = makeTour(
	<Tour
		name="jetpackPluginUpdates"
		version="20180611"
		when={ state => PluginsStore.getSitePlugin( getSelectedSite( state ), 'jetpack' ) }
	>
		<Step
			name="init"
			wait={ () => !! query( '.plugin-item-jetpack .form-toggle:enabled' ).length }
			target=".plugin-item-jetpack .form-toggle__switch"
			onTargetDisappear={
				/**
				 * noop
				 *
				 * Wait doesn't _wait_ for it's condition before calling this.
				 * This will therefore be called _before_ we've shown the tour.
				 * We don't want to quit in those cases :/
				 */
				() => {}
			}
			arrow="top-left"
			placement="below"
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
								'up-to-date with the latest features and security fixes.'
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
						<SiteLink isButton href={ '/plans/my-plan/:site' }>
							{ translate( "Yes, let's do it." ) }
						</SiteLink>
						<Quit>{ translate( 'No thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
