/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { makeTour, Tour, Step, ButtonRow, Next, Quit, Link } from 'layout/guided-tours/config-elements';
import { isDesktop } from 'lib/viewport';
import { isNewUser } from 'state/ui/guided-tours/contexts';

export const EditorBasicsTour = makeTour(
	<Tour
		name="editorBasicsTour"
		version="20170503"
		path="/post/"
		when={ and( isDesktop, isNewUser ) }
	>
		<Step
			name="init"
			arrow="top-left"
			target=".editor-title"
			placement="below"
			style={ { animationDelay: '5s', } }
		>
			<p>
				{ translate( 'Welcome to the editor! Add a title here.' ) }
			</p>
			<ButtonRow>
				<Next step="write" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="write"
			arrow="top-left"
			target=".editor-html-toolbar__buttons, .mce-toolbar-grp.mce-container"
			placement="below"
			style={ { marginTop: '40px' } }
		>
			<p>
				{ translate( 'Write your post in the content area.' ) }
			</p>
			<img
				src="https://i0.wp.com/en-support.files.wordpress.com/2017/03/editor-content-area_360.gif"
				style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
			/>
			<ButtonRow>
				<Next step="add-image" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="add-image"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-media, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '-10px', zIndex: 'auto' } }
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
				<Next step="add-other" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="add-other"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-media, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '22px', zIndex: 'auto' } }
		>
			<p>
				{
					translate(
						'The {{icon/}} lets you add other things, like a contact form. ' +
						'If your site is on the Premium or Business plan, you can even add {{strong}}payment buttons{{/strong}}!',
						{
							components: {
								strong: <strong />,
								icon: <Gridicon icon="chevron-down" />,
							}
						}
					)
				}
			</p>
			<ButtonRow>
				<Next step="sidebar-options" />
				<Quit />
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
				{ translate( 'Add tags, categories, and a featured image from the sidebar.' ) }
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
				<Next step="publish" />
				<Quit />
			</ButtonRow>
		</Step>
		<Step
			name="publish"
			arrow="right-top"
			target=".editor-ground-control__publish-button"
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
				<Quit primary>
					{ translate( "Got it, I'm ready to write!" ) }
				</Quit>
			</ButtonRow>
			<Link href="https://learn.wordpress.com/get-published/">
				{ translate( 'Learn more about publishing content.' ) }
			</Link>
		</Step>
	</Tour>
);
