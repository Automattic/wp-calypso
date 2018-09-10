/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import GridiconCheckmark from 'gridicons/dist/checkmark';
import { noop } from 'lodash';

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
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import { getSelectedSite } from 'state/ui/selectors';

function getAddDomainsPath( state ) {
	const site = getSelectedSite( state );
	return `/domains/add/${ site.domain }`;
}

function whenLeavesAddDomainsRoute( state ) {
	const lastRoute = getLastRouteAction( state );
	return ! ( lastRoute.path === getAddDomainsPath( state ) );
}

export const ChecklistDomainRegisterTour = makeTour(
	<Tour name="checklistDomainRegister" version="20180717" path="/domains/add" when={ noop }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.7s',
				marginTop: '-14px',
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Pick one of the suggestions below or type a memorable name to get started.'
						) }
					</p>
					<ButtonRow>
						<Continue hidden when={ whenLeavesAddDomainsRoute } step="finish" />
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
							<GridiconCheckmark className="tours__completed-icon" />
						</span>
						{ translate( 'Excellent, you’re on your way!' ) }
					</h1>
					<p>
						{ translate(
							'Just complete your purchase and your site will be sporting a cool new address!'
						) }
					</p>
					<Quit primary>{ translate( 'Hide' ) }</Quit>
				</Fragment>
			) }
		</Step>
	</Tour>
);
