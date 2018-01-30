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
	ButtonRow,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

function isPostEditorSection( state ) {
	return getSectionName( state ) === 'post-editor';
}

export const ChecklistPublishPostTour = makeTour(
	<Tour name="checklistPublishPost" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.7s',
			} }
			when={ isPostEditorSection }
			canSkip={ false }
		>
			<p>
				{ translate(
					'It’s time to get your blog rolling with your first post. Let’s replace the copy ' +
						'below with a brief introduction. Here are some questions that can help you out: ' +
						'Who are you and where are you based? Why did you start this site? What can ' +
						'visitors expect to get out of it?'
				) }
			</p>
			<ButtonRow>
				<Next step="categories-tags">{ translate( 'All done, continue' ) }</Next>
				<SiteLink href="/checklist/:site">{ translate( 'Return to the checklist' ) }</SiteLink>
				<Continue step="categories-tags" hidden />
			</ButtonRow>
		</Step>

		<Step
			name="categories-tags"
			target="accordion-categories-tags"
			arrow="right-top"
			placement="beside"
		>
			<p>
				{ translate(
					'Categories and Tags not only help organize your content but also bring people to ' +
						'your site via the Reader. Click on the {{b}}Categories and Tags{{/b}} section ' +
						'to expand it and pick one or two descriptive tags like "blogging" or "welcome" ' +
						'for it to start showing up to other users in the Reader.',
					{
						components: { b: <strong /> },
					}
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
			<Continue target="editor-featured-image-current-image" step="choose-image" click>
				<p>
					{ translate(
						'Featured images are a great way to add more personality to your pages. ' +
							'Let’s add something a little more relevant to your blog post.'
					) }
				</p>
				<p>{ translate( 'Press anywhere on this image so we can change it.' ) }</p>
			</Continue>
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
					'We’re all set, press {{b}}Set Featured Image{{/b}} to add this image to your blog post.',
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
				{ translate( 'You did it!' ) }
			</h1>
			<p>
				{ translate(
					'You published your first blog post. ' +
						'Let’s move on and see what’s next on our checklist.'
				) }
			</p>
			<SiteLink isButton href={ '/checklist/:site' }>
				{ translate( 'Return to the checklist' ) }
			</SiteLink>
		</Step>
	</Tour>
);
