/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import { delay, noop, negate as not } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { inSection } from 'state/ui/guided-tours/contexts';
import { query } from 'layout/guided-tours/positioning';
import {
	ButtonRow,
	ConditionalBlock,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';

function isSidebarOpen( state ) {
	return getCurrentLayoutFocus( state ) === 'sidebar';
}

function isFeaturedImageSet() {
	return !! query( '.editor-featured-image.is-assigned' ).length;
}

function openSidebar( props, context ) {
	const store = context.store;
	if ( store && getCurrentLayoutFocus( store.getState() ) !== 'sidebar' ) {
		store.dispatch( setLayoutFocus( 'sidebar' ) );
	}

	return new Promise( function( resolve, reject ) {
		getCurrentLayoutFocus( store.getState() ) === 'sidebar' ? delay( resolve, 200 ) : reject();
	} );
}

function openFeatureImageUploadDialog() {
	if ( ! query( '.editor-media-modal' ).length ) {
		const buttons = query(
			'[data-tip-target="accordion-featured-image"] .editor-drawer-well__placeholder, ' +
				'[data-tip-target="accordion-featured-image"] .editor-featured-image__preview .image-preloader'
		);
		if ( buttons.length ) {
			buttons[ 0 ].click();
		}
	}

	return true;
}

export const ChecklistPublishPostTour = makeTour(
	<Tour name="checklistPublishPost" version="20171205" path="/non-existent-route" when={ noop }>
		<Step
			name="init"
			placement="right"
			style={ {
				animationDelay: '0.7s',
				zIndex: 2,
			} }
			when={ inSection( 'post-editor' ) }
			canSkip={ false }
		>
			{ ( { translate } ) => (
				<Fragment>
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
				</Fragment>
			) }
		</Step>

		<Step
			name="categories-tags"
			target="accordion-categories-tags"
			arrow="right-top"
			placement="beside"
			style={ {
				marginTop: '-10px',
				marginLeft: '-40px',
			} }
			wait={ openSidebar }
		>
			{ ( { translate } ) => (
				<Fragment>
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
				</Fragment>
			) }
		</Step>

		<Step
			name="featured-images"
			target="editor-featured-image-current-image"
			arrow="top-left"
			placement="below"
			when={ isFeaturedImageSet }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="editor-featured-image-current-image" step="choose-image" click>
						<p>
							{ translate(
								'Featured images are a great way to add more personality to your pages. ' +
									'Let’s add something a little more relevant to your blog post.'
							) }
						</p>
						<p>{ translate( 'Press anywhere on this image so we can change it.' ) }</p>
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step
			name="choose-image"
			target="media-library-upload-more"
			placement="beside"
			arrow="left-top"
			style={ { marginTop: '-10px' } }
			wait={ openFeatureImageUploadDialog }
		>
			{ ( { translate } ) => (
				<Fragment>
					<ConditionalBlock when={ not( isFeaturedImageSet ) }>
						<p>
							{ translate(
								'Featured images are a great way to add more personality to your pages. ' +
									'Let’s add something a little more relevant to your blog post.'
							) }
						</p>
					</ConditionalBlock>
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
			when={ isSidebarOpen }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="dialog-base-action-confirm" step="click-update" click>
						{ translate(
							'We’re all set, press {{b}}Set Featured Image{{/b}} to add this image to your blog post.',
							{
								components: { b: <strong /> },
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
						{ translate( 'Almost done, press the {{b}}Update{{/b}} button to save your changes.', {
							components: { b: <strong /> },
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
				</Fragment>
			) }
		</Step>
	</Tour>
);
