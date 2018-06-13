/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import Gridicon from 'gridicons';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	Continue,
	makeTour,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

export const JetpackPluginUpdatesTour = makeTour(
	<Tour name="jetpackPluginUpdates" version="20180611" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			target="#plugin-jetpack .form-toggle__switch"
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
						<Continue target="#plugin-jetpack .form-toggle__switch" step="finish" click hidden />
						<SiteLink isButton={ false } href="/checklist/:site">
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
					<SiteLink isButton href={ '/checklist/:site' }>
						{ translate( 'Return to the checklist' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
