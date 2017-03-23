/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import {
	overEvery as and,
} from 'lodash';
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
} from 'layout/guided-tours/config-elements';
import {
	isNewUser,
} from 'state/ui/guided-tours/contexts';
import { isDesktop } from 'lib/viewport';

export const EditorBasicsTour = makeTour(
	<Tour
		name="editorBasicsTour"
		version="20170321"
		path="/post/"
		when={ and(
			isDesktop,
			isNewUser,
			) }
		>
		<Step
			name="init"
			arrow="top-left"
			target=".editor-title"
			placement="below"
			style={ { animationDelay: '5s', } }
			>
			<p>
				Welcome to the editor! Add a title here.
			</p>
			<ButtonRow>
				<Next step="write">Continue</Next>
				<Quit>Quit</Quit>
			</ButtonRow>
		</Step>
		<Step
			name="write"
			arrow="top-left"
			target=".mce-toolbar-grp.mce-container"
			placement="below"
			style={ { marginTop: '40px' } }
			>
			<p>
				Write your post in the content area.
			</p>
			<img
				src="https://en-support.files.wordpress.com/2017/03/editor-content-area_360.gif"
				style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
				/>
			<ButtonRow>
				<Next step="add-image">Continue</Next>
				<Quit>Quit</Quit>
			</ButtonRow>
		</Step>
		<Step
			name="add-image"
			arrow="top-left"
			target=".mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '-10px', minWidth: '240px' } }
			>
			<p>
				{
					translate( 'Click the {{icon/}} to add images.', {
						components: {
							icon: <Gridicon icon="add-outline" />,
						}
					} )
				}
			</p>
			<ButtonRow>
				<Next step="sidebar-options">Continue</Next>
				<Quit>Quit</Quit>
			</ButtonRow>
		</Step>
		<Step
			name="sidebar-options"
			arrow="right-top"
			target=".editor-ground-control__toggle-sidebar"
			placement="beside"
			style={ { marginTop: '-9px' } }
			>
			<p>
				Find additional settings in the sidebar — such as tags, categories, and the featured image.
			</p>
			<p>
				{
					translate( 'Click the {{icon/}} to show or hide these settings.', {
						components: {
							icon: <Gridicon icon="cog" />,
						}
					} )
				}

			</p>
			<ButtonRow>
				<Next step="publish">Continue</Next>
				<Quit>Quit</Quit>
			</ButtonRow>
		</Step>
		<Step
			name="publish"
			arrow="right-top"
			target=".editor-ground-control__publish-combo"
			placement="beside"
			style={ { marginTop: '-17px' } }
			>
			<p>
				{
					translate( 'Your changes are saved automatically. ' +
									'Click {{strong}}Publish{{/strong}} to share your work with the world!',
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<ButtonRow>
				<Quit primary>Got it, I'm ready to write!</Quit>
			</ButtonRow>
		</Step>
	</Tour>
);
