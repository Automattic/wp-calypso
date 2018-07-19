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
	Next,
	Quit,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

export const ChecklistDomainRegisterTour = makeTour(
	<Tour name="checklistDomainRegister" version="20180717" path="/domains/add" when={ noop }>
		<Step
			name="init"
			target=".search__icon-navigation"
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
						<Continue target=".search__input" step="search-results" click hidden />
						<Next step="search-results" />
						<SiteLink isButton={ false } href="/checklist/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="search-results" arrow="bottom-left" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<p> { translate( 'When you find a name you like, click "Select"' ) }</p>
					<ButtonRow>
						<Next step="finish" />
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
							'Just complete your purchase and your site will be sporting a cool new address!'
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( 'Done' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
