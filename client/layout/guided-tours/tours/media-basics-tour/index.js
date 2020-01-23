/**
 * External dependencies
 */

import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import meta from './meta';
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Continue,
} from 'layout/guided-tours/config-elements';
import { doesSelectedSiteHaveMediaFiles } from 'state/ui/guided-tours/contexts';
import {
	AddNewButton,
	EditButton,
	EditImageButton,
	DoneButton,
} from 'layout/guided-tours/button-labels';

export const MediaBasicsTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			arrow="top-left"
			target=".media-library__upload-buttons"
			placement="below"
			style={ { animationDelay: '2s' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Welcome to your media libary!' ) }</p>
					<p>
						{ translate(
							'Upload media — photos, documents, audio files, and more — ' +
								'by clicking the {{addNewButton/}} button.',
							{
								components: {
									addNewButton: <AddNewButton />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Next step="drag-and-drop" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="drag-and-drop" placement="right">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'You can also drag-and-drop image and video files from your computer into your media library.'
						) }
					</p>
					<img
						src="https://i0.wp.com/en-support.files.wordpress.com/2017/07/media-drag-and-drop.gif"
						style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
						alt=""
					/>
					<ButtonRow>
						<Next step="select-image" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="select-image"
			placement="below"
			arrow="top-left"
			target=".media-library__list-item:not(.is-selected), .media-library__list-item"
			style={ { marginTop: '-10px' } }
			when={ doesSelectedSiteHaveMediaFiles }
			next="done-no-media"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Once you upload a file, you can edit its title, add a caption, and even do basic photo editing.'
						) }
					</p>
					<Continue
						click
						step="click-to-edit"
						target={
							'.media-library__list-item:not(.is-selected) .media-library__list-item-figure, ' +
							'.media-library__list-item-figure'
						}
					>
						{ translate( 'To find these options, click on this file to select it.' ) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-to-edit"
			placement="below"
			arrow="top-left"
			target=".editor-media-modal__secondary-action"
			style={ { marginLeft: '-8px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<Continue click step="launch-modal" target=".editor-media-modal__secondary-action">
						{ translate( 'Now click the {{editButton/}} button.', {
							components: {
								editButton: <EditButton />,
							},
						} ) }
					</Continue>
				</Fragment>
			) }
		</Step>

		<Step name="launch-modal" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Here you can edit the title, add a caption, find the media URL, and see other details.'
						) }
					</p>
					<ButtonRow>
						<Next step="adjust-image" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="adjust-image" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Need to adjust your image? Click {{editImageButton/}} to perform basic tweaks.',
							{
								components: {
									editImageButton: <EditImageButton />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Next step="personal-files-warning" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="personal-files-warning"
			target=".detail__url-field"
			placement="below"
			arrow="top-left"
			style={ { marginTop: '-8px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'All files you upload to WordPress.com get their own web address. ' +
								'If your site is public, any file can technically be accessed ' +
								"by anyone who has its address, even if you haven't included it " +
								"in a post. It's unlikely, but possible."
						) }
					</p>
					<p>
						{ translate( "In other words, this probably isn't the place for personal files!" ) }
					</p>
					<ButtonRow>
						<Next step="done" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="done"
			target=".dialog__action-buttons .button.is-primary"
			placement="above"
			arrow="bottom-right"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Click {{doneButton /}} to go back to your full library. Happy uploading!',
							{
								components: {
									doneButton: <DoneButton />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( "Got it, I'm ready to explore!" ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="done-no-media" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Once you upload media files, you can edit them — change titles, do basic image editing, and more — ' +
								"and they'll be ready and waiting for you to add to posts and pages."
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( "Got it, I'm ready to explore!" ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
