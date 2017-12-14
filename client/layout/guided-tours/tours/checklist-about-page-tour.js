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
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

export const ChecklistAboutPageTour = makeTour(
	<Tour name="checklistAboutPage" version="20171205" path="/non-existent-route" when={ noop }>
		<Step name="init" placement="right">
			<p>
				{ translate(
					'The About Page is often the most visited page on a site. ' +
						"You might find that it never feels quite done - that's OK. " +
						'This is the internet and we can update it as many times as we want. ' +
						'The key is to just get it started.'
				) }
			</p>
			<p>
				{ translate(
					"Let's start by changing the default text with an introduction. " +
						'Here are some questions to help you out: Who are you and where are you based?' +
						'Why did you start this site? ' +
						'What can visitors expect to get out of it?'
				) }
			</p>
			<ButtonRow>
				<Next step="featured-images">{ translate( 'All done, continue' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
			</ButtonRow>
		</Step>

		<Step
			name="featured-images"
			target="accordion-item-featured-image"
			arrow="right-top"
			placement="beside"
		>
			<p>
				{ translate(
					'Featured images are a great way to add more personality to your pages. ' +
						"Let's add something a little more relevant to your About page text."
				) }
			</p>
			<p>
				{ translate( 'Press the X button so we can remove the existing image and add a new one.' ) }
			</p>
		</Step>

		<Step name="finish" placement="right">
			<h1 className="tours__title">
				<span className="tours__completed-icon-wrapper">
					<Gridicon icon="checkmark" className="tours__completed-icon" />
				</span>
				{ translate( 'Good job, looks great!' ) }
			</h1>
			<p>
				{ translate(
					"Your changes have been saved. Let's move on and see what's next on our checklist."
				) }
			</p>
			<SiteLink isButton="true" href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
