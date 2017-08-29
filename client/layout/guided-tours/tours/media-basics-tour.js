/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Continue
} from 'layout/guided-tours/config-elements';
import {
	doesSelectedSiteHaveMediaFiles,
	isNewUser,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const MediaBasicsTour = makeTour(
	<Tour
		name="mediaBasicsTour"
		version="20170321"
		path="/media"
		when={ and(
			isDesktop,
			isNewUser,
			doesSelectedSiteHaveMediaFiles,
		) }
	>
		<Step
			name="init"
			arrow="top-left"
			target=".media-library__upload-buttons"
			placement="below"
		>
			<p>
				{ translate( 'Welcome to your media libary!' ) }
			</p>
			<p>
				{
					translate( 'Upload media — photos, documents, audio files, and more — ' +
						'by clicking the {{icon/}} {{strong}}Add New{{/strong}} button.',
						{
							components: {
								icon: <Gridicon icon="add-image" />,
								strong: <strong />,
							}
						}
					)
				}
			</p>
			<ButtonRow>
				<Next step="drag-and-drop" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step
			name="drag-and-drop"
			placement="right"
		>
			<p>
				{ translate( 'You can also drag-and-drop image and video files from your computer into your media library.' ) }
			</p>
			<img
				src="https://i0.wp.com/en-support.files.wordpress.com/2017/07/media-drag-and-drop.gif"
				style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
			/>

			<ButtonRow>
				<Next step="select-image" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step
			name="select-image"
			placement="below"
			arrow="top-left"
			target=".media-library__list-item:not(.is-selected), .media-library__list-item"
			style={ { marginTop: '-10px' } }
		>
			<p>
				{ translate( 'Once you upload a file, you can edit its title, add a caption, and even do basic photo editing.' ) }
			</p>
			<Continue
				click
				step="click-to-edit"
				target=".media-library__list-item:not(.is-selected) .media-library__list-item-figure, .media-library__list-item-figure"
			>
				{ translate( 'To find these options, click on this file to select it.' ) }
			</Continue>
		</Step>

		<Step name="click-to-edit"
			placement="below"
			arrow="top-left"
			target=".editor-media-modal__secondary-action"
			style={ { marginLeft: '-8px' } }
		>
			<Continue click step="launch-modal" target=".editor-media-modal__secondary-action">
				{
					translate( 'Now click the {{strong}}Edit{{/strong}} button.',
						{
							components: {
								strong: <strong />,
							}
						}
					)
				}
			</Continue>
		</Step>

		<Step name="launch-modal"
			placement="center"
		>
			<p>
				{ translate( 'Here you can edit the title, add a caption, find the media URL, and see other details.' ) }
			</p>
			<ButtonRow>
				<Next step="done" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="done"
			placement="center"
		>
			<p>
				{
					translate( 'Need to adjust your image? Click {{icon/}} {{strong}}Edit Image{{/strong}} to perform basic tweaks.',
						{
							components: {
								icon: <Gridicon icon="pencil" />,
								strong: <strong />,
							}
						}
					)
				}
			</p>
			<p>
				{
					translate( 'Click {{strong}}Done{{/strong}} to go back to your full library. Happy uploading!',
						{
							components: {
								strong: <strong />,
							}
						}
					)
				}
			</p>
			<ButtonRow>
				<Quit primary>{ translate( "Got it, I'm ready to explore!" ) }</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
