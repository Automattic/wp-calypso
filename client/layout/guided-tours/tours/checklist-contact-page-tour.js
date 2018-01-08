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
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

export const ChecklistContactPageTour = makeTour(
	<Tour name="checklistContactPage" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			placement="beside"
			arrow="left-top"
			target="side-menu-page"
			style={ {
				animationDelay: '0s',
			} }
		>
			<p>
				{ translate( 'Click on {{b}}Site Pages{{/b}} to see all the pages on your site.', {
					components: { b: <strong /> },
				} ) }
			</p>
			<Continue target="side-menu-page" step="choose-page" click hidden />
		</Step>

		<Step name="choose-page" target="page-contact" arrow="top-left" placement="below">
			<p>
				{ translate( 'Click {{b}}Contact{{/b}} to edit this page.', {
					components: { b: <strong /> },
				} ) }
			</p>
			<Continue target="page-contact" step="contact-page" click hidden />
		</Step>

		<Step name="contact-page" placement="right">
			<p>
				{ translate(
					'Your contact page makes it easy for people to reach out and get in touch. ' +
						'Let’s personalize this page by editing the default text so that people ' +
						'know how and when they can contact you.'
				) }
			</p>
			<Next step="featured-images">{ translate( 'All done, continue' ) }</Next>
		</Step>

		<Step
			name="featured-images"
			target="editor-featured-image-current-image"
			arrow="top-left"
			placement="below"
		>
			<p>
				{ translate(
					'Featured images are a great way to add more personality to your pages. ' +
						'Let’s add something a little more relevant to your contact page text.'
				) }
			</p>
			<p>{ translate( 'Press anywhere on this image so we can change it.' ) }</p>
			<Continue target="editor-featured-image-current-image" step="choose-image" click hidden />
		</Step>

		<Step
			name="choose-image"
			target="media-library-upload-more"
			placement="beside"
			arrow="left-top"
		>
			<p>{ translate( 'Either pick an image below or add a new one from your computer.' ) }</p>
			<Next step="click-set-featured-image">{ translate( 'All done, continue' ) }</Next>
		</Step>

		<Step
			name="click-set-featured-image"
			target="dialog-base-action-confirm"
			arrow="right-top"
			placement="beside"
		>
			<Continue target="dialog-base-action-confirm" step="click-update" click>
				{ translate(
					'We’re all set, press {{b}}Set Featured Image{{/b}} to add this image to your page.',
					{
						components: { b: <strong /> },
					}
				) }
			</Continue>
		</Step>

		<Step name="click-update" target="editor-publish-button" arrow="right-top" placement="beside">
			<Continue target="editor-publish-button" step="finish" click>
				{ translate( 'Almost done, press the {{b}}Update{{/b}} button to save your changes.', {
					components: { b: <strong /> },
				} ) }
			</Continue>
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
					'The updates to your Contact page are being saved. When the page is done saving, let’s return ' +
						'to our checklist and see what’s next.'
				) }
			</p>
			<SiteLink isButton href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
