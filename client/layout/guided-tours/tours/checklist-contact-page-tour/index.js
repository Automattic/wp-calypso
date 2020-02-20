/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import meta from './meta';
import { getSectionName } from 'state/ui/selectors';
import {
	Continue,
	ButtonRow,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { SetFeaturedImageButton, UpdateButton } from 'layout/guided-tours/button-labels';

function isPostEditorSection( state ) {
	return getSectionName( state ) === 'post-editor';
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistContactPageTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.7s',
				zIndex: 2,
			} }
			when={ isPostEditorSection }
			canSkip={ false }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Your contact page makes it easy for people to get in touch. Let’s personalize ' +
								'this page by adding some explaining when and how people can contact you. ' +
								'Click in the text area below to get started.'
						) }
					</p>
					<ButtonRow>
						<Next step="featured-images">{ translate( 'All done, continue' ) }</Next>
						<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
						<Continue step="featured-images" hidden />
					</ButtonRow>
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
								'Let’s add something a little more relevant to you and your site.'
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
			style={ {
				marginTop: '-10px',
				marginLeft: '-40px',
			} }
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
			style={ { marginTop: '-10px' } }
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

		<Step
			name="click-update"
			target="editor-publish-button"
			arrow="right-top"
			placement="beside"
			style={ { marginTop: '-10px' } }
		>
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
							'The updates to your Contact page are being saved. When the page is done saving, let’s return ' +
								'to our checklist and see what’s next.'
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
