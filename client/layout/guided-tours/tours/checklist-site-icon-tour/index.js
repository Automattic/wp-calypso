/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	ButtonRow,
	Continue,
	makeTour,
	Next,
	SiteLink,
	Step,
	Tour,
} from 'layout/guided-tours/config-elements';
import { ChangeButton, ContinueButton, DoneButton } from 'layout/guided-tours/button-labels';

function handleTargetDisappear( { quit, next } ) {
	const dialog = document.querySelector( '.editor-media-modal' );
	if ( dialog ) {
		next();
	} else {
		quit();
	}
}

/* eslint-disable wpcalypso/jsx-classname-namespace */
export const ChecklistSiteIconTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			target="settings-site-icon-change"
			arrow="top-left"
			placement="below"
			style={ {
				animationDelay: '0.7s',
				zIndex: 1,
			} }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Press {{changeButton/}} to upload your own image or icon ' +
								'that can help people identify your site in the browser.',
							{
								components: { changeButton: <ChangeButton /> },
							}
						) }
					</p>
					<ButtonRow>
						<Continue target="settings-site-icon-change" step="choose-image" click hidden />
						<SiteLink isButton={ false } href="/checklist/:site">
							{ translate( 'Return to the checklist' ) }
						</SiteLink>
					</ButtonRow>
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
			onTargetDisappear={ handleTargetDisappear }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Pick or drag a file from your computer to add it to your media library.'
						) }
					</p>
					<Next step="click-continue">{ translate( 'All done, continue' ) }</Next>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-continue"
			target="dialog-base-action-confirm"
			arrow="bottom-center"
			placement="above"
			style={ { marginTop: '40px', marginLeft: '60px' } }
			onTargetDisappear={ handleTargetDisappear }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="dialog-base-action-confirm" step="click-done" click>
						{ translate( 'Good choice, press {{continueButton/}} to use it as your Site Icon.', {
							components: { continueButton: <ContinueButton /> },
						} ) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-done"
			target="image-editor-button-done"
			arrow="bottom-center"
			placement="above"
			style={ { marginTop: '30px', marginLeft: '90px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue target="image-editor-button-done" step="finish" click>
						{ translate(
							'Let’s make sure it looks right before you press {{doneButton/}} to save your changes.',
							{ components: { doneButton: <DoneButton /> } }
						) }
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
						{ translate( 'Excellent, you’re done!' ) }
					</h1>
					<p>
						{ translate(
							'Your Site Icon has been saved. Let’s move on and see what’s next on our checklist.'
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
