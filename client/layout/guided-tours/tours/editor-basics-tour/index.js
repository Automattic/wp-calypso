/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import Gridicon from 'calypso/components/gridicon';

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
	Link,
} from 'calypso/layout/guided-tours/config-elements';
import { PublishButton } from 'calypso/layout/guided-tours/button-labels';

export const EditorBasicsTour = makeTour(
	<Tour { ...meta }>
		<Step
			name="init"
			arrow="top-left"
			target=".editor-title"
			placement="below"
			style={ { animationDelay: '5s' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Welcome to the editor! Add a title here.' ) }</p>
					<ButtonRow>
						<Next step="write" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="write"
			arrow="top-left"
			target=".editor-html-toolbar__buttons, .mce-toolbar-grp.mce-container"
			placement="below"
			style={ { marginTop: '40px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Write your post in the content area.' ) }</p>
					<img
						src="https://i0.wp.com/en-support.files.wordpress.com/2017/03/editor-content-area_360.gif"
						style={ { marginBottom: '10px', border: '3px solid #00AADC', borderRadius: '4px' } }
						alt=""
					/>
					<ButtonRow>
						<Next step="add-things" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="add-things"
			arrow="top-left"
			target=".editor-html-toolbar__button-insert-content-dropdown, .mce-wpcom-insert-menu button"
			placement="below"
			style={ { marginLeft: '-7px', zIndex: 'auto' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Click the {{icon/}} to add images and other things, like a contact form. ' +
								'Sites on the Premium and Business plans can add {{strong}}payment buttons{{/strong}} — ' +
								'sell tickets, collect donations, accept tips, and more.',
							{
								components: {
									strong: <strong />,
									icon: <Gridicon icon="add-outline" />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Next step="sidebar-options" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="sidebar-options"
			arrow="right-top"
			target=".editor-ground-control__toggle-sidebar"
			placement="beside"
			style={ { marginTop: '-9px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Add tags, categories, and a featured image from the sidebar.' ) }</p>
					<p>
						{ translate( 'Click the {{icon/}} to show or hide these settings.', {
							components: {
								icon: <Gridicon icon="cog" />,
							},
						} ) }
					</p>
					<ButtonRow>
						<Next step="publish" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>
		<Step
			name="publish"
			arrow="right-top"
			target=".editor-ground-control__publish-button"
			placement="beside"
			style={ { marginTop: '-17px' } }
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Your changes are saved automatically. ' +
								'Click {{publishButton/}} to share your work with the world!',
							{
								components: {
									publishButton: <PublishButton />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( "Got it, I'm ready to write!" ) }</Quit>
					</ButtonRow>
					<Link href="https://learn.wordpress.com/get-published/">
						{ translate( 'Learn more about publishing content.' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
