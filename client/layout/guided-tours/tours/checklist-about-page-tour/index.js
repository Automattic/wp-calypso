/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { Gridicon } from '@automattic/components';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { SetFeaturedImageButton, UpdateButton } from 'layout/guided-tours/button-labels';

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistAboutPageTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" target="page-about" arrow="top-left" placement="below">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate( 'Click {{b}}About{{/b}} to edit this page.', {
							components: { b: <strong /> },
						} ) }
					</p>
					<Continue target="page-about" step="about-page" click hidden />
				</Fragment>
			) }
		</Step>

		<Step name="about-page" placement="right">
			{ ( { translate } ) => (
				<Fragment>
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
				</Fragment>
			) }
		</Step>

		<Step
			name="featured-images"
			target="editor-featured-image-current-image"
			arrow="top-left"
			placement="below"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Featured images are a great way to add more personality to your pages. ' +
								'Let’s add something a little more relevant to your About page text.'
						) }
					</p>
					<p>{ translate( 'Press anywhere on this image so we can change it.' ) }</p>
					<Continue target="editor-featured-image-current-image" step="choose-image" click hidden />
				</Fragment>
			) }
		</Step>

		<Step
			name="choose-image"
			target="media-library-upload-more"
			placement="beside"
			arrow="left-top"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Either pick an image below or add a new one from your computer.' ) }</p>
					<Next step="click-set-featured-image">{ translate( 'All done, continue' ) }</Next>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-set-featured-image"
			target="dialog-base-action-confirm"
			arrow="right-top"
			placement="beside"
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="dialog-base-action-confirm" step="click-update" click>
						{ translate(
							'We’re all set, press {{setFeaturedImageButton/}} to add this image to your page.',
							{
								components: {
									setFeaturedImageButton: <SetFeaturedImageButton />,
								},
							}
						) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step name="click-update" target="editor-publish-button" arrow="right-top" placement="beside">
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="editor-publish-button" step="finish" click>
						{ translate( 'Almost done, press the {{updateButton/}} button to save your changes.', {
							components: { updateButton: <UpdateButton /> },
						} ) }
					</Continue>
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
						{ translate( 'Good job, looks great!' ) }
					</h1>
					<p>
						{ translate(
							'The updates to your About page are being saved. When the page is done saving, let’s ' +
								'return to our checklist and see what’s next.'
						) }
					</p>
					<SiteLink isButton href="/checklist/:site">
						{ translate( 'Return to the checklist' ) }
					</SiteLink>
				</Fragment>
			) }
		</Step>
	</Tour>
);
