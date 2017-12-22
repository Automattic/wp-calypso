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
import { Continue, makeTour, SiteLink, Step, Tour } from 'layout/guided-tours/config-elements';

export const ChecklistRegisterDomainTour = makeTour(
	<Tour name="checklistRegisterDomain" version="20171219" path="/domains/add" when={ noop }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.3s',
			} }
			target="domain-suggestion"
		>
			<p>
				{ translate(
					'Search engines like Google and Bing prefer custom domain names and place ' +
						'them higher in search results.'
				) }
			</p>

			<p>
				{ translate( 'Start by searching for a unique but memorable domain name for your site.' ) }
			</p>

			<Continue target="domain-suggestion" step="email-step" click hidden />
			<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
		</Step>

		<Step name="email-step" placement="right">
			<p>
				{ translate(
					'If you need email, use G Suite by Google Cloud to manage your emails and more.'
				) }
			</p>

			<Continue target="gsuite-continue" step="email-step-2" click hidden />
			<Continue target="gsuite-cancel" step="contact-information" click hidden />
		</Step>

		<Step name="email-step-2" placement="right">
			<p>
				{ translate(
					'Great choice! Enter your email address(es) and then press {{b}}Continue{{/b}}.',
					{
						components: { b: <strong /> },
					}
				) }
			</p>
			<Continue target="gsuite-continue" step="contact-information" click hidden />
		</Step>

		<Step name="contact-information" placement="right">
			<p>
				{ translate(
					'Enter your domain contact information for your domain ' +
						'records then press {{b}}Continue to Checkout{{/b}}.',
					{
						components: { b: <strong /> },
					}
				) }
			</p>

			<Continue target="domain-details-submit" step="checkout-step" click hidden />
		</Step>

		<Step name="checkout-step" placement="right">
			<p>
				{ translate(
					'Almost done! Enter your payment information and press {{b}}Pay{{/b}} ' +
						'to complete your purchase.',
					{
						components: { b: <strong /> },
					}
				) }
			</p>

			<Continue target="pay-button" step="finish" click hidden />
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
