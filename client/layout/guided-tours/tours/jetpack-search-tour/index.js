/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import meta from './meta';
import {
	ButtonRow,
	Continue,
	makeTour,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'calypso/layout/guided-tours/config-elements';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const JetpackSearchTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target=".jetpack-search-settings .components-form-toggle"
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
							'Jetpack Search replaces the built-in WordPress search tool ' +
								"with one that's faster and filterable."
						) }
					</p>
					<ButtonRow>
						<Continue
							target=".jetpack-search-settings .components-form-toggle"
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
							'Jetpack Search is active on your site. Ready for the next performance feature?'
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
