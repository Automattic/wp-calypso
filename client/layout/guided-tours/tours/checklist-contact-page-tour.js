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

function isPostEditorSection( state ) {
	return getSectionName( state ) === 'post-editor';
}

const SetFeaturedImageButtonLabel = translate( 'Set Featured Image' );
const UpdateButtonLabel = translate( 'Update' );

export const ChecklistContactPageTour = makeTour(
	<Tour name="checklistContactPage" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
			when={ isPostEditorSection }
			canSkip={ false }
		>
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
						'Let’s add something a little more relevant to you and your site.'
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
			style={ {
				marginTop: '-10px',
				marginLeft: '-40px',
			} }
		>
			<p>{ translate( 'Either pick an image below or add a new one from your computer.' ) }</p>
			<Next step="click-set-featured-image">{ translate( 'All done, continue' ) }</Next>
		</Step>

		<Step
			name="click-set-featured-image"
			target="dialog-base-action-confirm"
			arrow="right-top"
			placement="beside"
			style={ { marginTop: '-10px' } }
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

		<Step
			name="click-update"
			target="editor-publish-button"
			arrow="right-top"
			placement="beside"
			style={ { marginTop: '-10px' } }
		>
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
