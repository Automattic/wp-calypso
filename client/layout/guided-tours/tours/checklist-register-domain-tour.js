/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';
import Gridicon from 'gridicons';

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

export const ChecklistRegisterDomainTour = makeTour(
	<Tour name="checklistRegisterDomain" version="20171219" path="/domains/add" when={ noop }>
		<Step
			name="init"
			arrow="right-top"
			placement="beside"
			style={ {
				animationDelay: '0.7s',
			} }
			target=".register-domain-step__search .search-card"
		>
			<p>
				{ translate(
					'Search engines like Google and Bing prefer custom domain names and place them higher in search results.'
				) }
			</p>
			<Continue target=".domain-suggestion" step="email-step" click hidden />
			<Continue target=".domain-search-results" step="email-step" click hidden />
			<ButtonRow>
				<Next step="email-step">{ translate( 'Got it, thanks!' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step
			name="email-step"
			arrow="top-right"
			placement="below"
			target=".google-apps-dialog__continue-button"
		>
			<p>{ translate( 'Use G Suite by Google Cloud to manage your emails and more.' ) }</p>

			<Continue target=".google-apps-dialog__continue-button" step="email-step-2" click hidden />
			<Continue target=".google-apps-dialog__cancel-link" step="contact-information" click hidden />

			<ButtonRow>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step
			name="email-step-2"
			arrow="bottom-left"
			placement="above"
			target=".google-apps-dialog__user-email"
		>
			<p>{ translate( 'Enter the email address to be created and move to the next step.' ) }</p>
			<Continue
				target=".google-apps-dialog__continue-button"
				step="contact-information"
				click
				hidden
			/>
			<ButtonRow>
				<Next step="contact-information">{ translate( 'Got it, thanks!' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step
			name="contact-information"
			arrow="bottom-left"
			placement="above"
			target=".checkout__payment-box-container .domain-details #first-name"
		>
			<p>{ translate( 'Enter your domain contact information for your domain records.' ) }</p>

			<Continue
				target=".checkout__domain-details-form-submit-button"
				step="contact-information-2"
				click
				hidden
			/>

			<ButtonRow>
				<Next step="contact-information-2">{ translate( 'Got it, thanks!' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step
			name="contact-information-2"
			arrow="top-right"
			placement="below"
			target=".checkout__domain-details-form-submit-button"
		>
			<p>{ translate( 'One final step is remaining!' ) }</p>

			<Continue
				target=".checkout__domain-details-form-submit-button"
				step="checkout-step"
				click
				hidden
			/>
		</Step>

		<Step
			name="checkout-step"
			arrow="top-right"
			placement="below"
			target="g.checkout__secure-payment-content"
		>
			<p>{ translate( 'Enter your payment information to complete your purchase.' ) }</p>

			<Continue target=".pay-button__button" step="finish" click hidden />

			<ButtonRow>
				<Quit>{ translate( 'Got it, thanks!' ) }</Quit>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step name="finish" placement="right">
			<h1 className="tours__title">
				<span className="tours__completed-icon-wrapper">
					<Gridicon icon="checkmark" className="tours__completed-icon" />
				</span>
				{ translate( 'Good job, looks great!' ) }
			</h1>
			<SiteLink isButton="true" href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
