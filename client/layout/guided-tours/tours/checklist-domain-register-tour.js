/** @format */
/**
        COPIED FROM SITE ICON TOUR CHANGE EVERYTHING
 */

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

export const ChecklistDomainRegisterTour = makeTour(
	<Tour name="checklistDomainRegister" version="20180717" path="/domains/add" when={ noop }>
		<Step
			name="init"
			target="domain-search"
			arrow="top-left"
			placement="below"
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Type a memorable name here to help people find your site.' ) }</p>
					<ButtonRow>
						<Continue target="settings-site-icon-change" step="choose-image" click hidden />
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
							'Your Site Icon has been saved. Let’s move on and see what’s next on our checklist.'
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
