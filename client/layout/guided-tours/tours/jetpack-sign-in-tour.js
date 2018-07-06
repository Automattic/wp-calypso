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

export const JetpackSignInTour = makeTour(
	<Tour name="jetpackSignIn" version="20180704">
		<Step
			name="init"
			target=".sso__card .form-toggle__switch"
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
							"Let's enable sign in using WordPress.com's secure authentication " +
								'for easy login by activating the toggle switch above.'
						) }
					</p>
					<ButtonRow>
						<Continue target=".sso__card .form-toggle__switch" step="finish" click hidden />
						<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
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
							'You can now sign into your Jetpack site with your WordPress.com account. ' +
								'Would you like to continue setting up the security essential features for your site?'
						) }
					</p>
					<ButtonRow>
						<SiteLink isButton href={ '/checklist/:site' }>
							{ translate( "Yes, let's do it." ) }
						</SiteLink>
						<Quit>{ translate( 'No thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
