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

const SetFeaturedImageButtonLabel = translate( 'Set Featured Image' );
const UpdateButtonLabel = translate( 'Update' );

export const ChecklistAboutPageTour = makeTour(
	<Tour name="checklistAboutPage" version="20171205" path="/non-existent-route" when={ noop }>
		<Step name="init" target="page-about" arrow="top-left" placement="below">
			<p>
				{ translate( 'Click {{b}}About{{/b}} to edit this page.', {
					components: { b: <strong /> },
				} ) }
			</p>
			<Continue target="page-about" step="about-page" click hidden />
		</Step>

		<Step name="about-page" placement="right">
			<p>
				{ translate(
					'The About Page is often the most visited page on a site. You might find ' +
						'that it never feels quite done - that’s OK. This is the internet and ' +
						'we can update it as many times as we want. The key is to just get it started.'
				) }
			</p>
			<p>
				{ translate(
					'Let’s change the default text with a new introduction. Here are some questions ' +
						'to help you out: Who are you and where are you based? Why did you start this site? ' +
						'What can visitors expect to get out of it?'
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
						'Let’s add something a little more relevant to your About page text.'
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
					'We’re all set, press {{SetFeaturedImageButton/}} to add this image to your page.',
					{
						components: {
							SetFeaturedImageButton: <strong>{ SetFeaturedImageButtonLabel }</strong>,
						},
					}
				) }
			</Continue>
		</Step>

		<Step name="click-update" target="editor-publish-button" arrow="right-top" placement="beside">
			<Continue target="editor-publish-button" step="finish" click>
				{ translate( 'Almost done, press the {{UpdateButton/}} button to save your changes.', {
					components: { UpdateButton: <strong>{ UpdateButtonLabel }</strong> },
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
					'The updates to your About page are being saved. When the page is done saving, let’s ' +
						'return to our checklist and see what’s next.'
				) }
			</p>
			<SiteLink isButton href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
