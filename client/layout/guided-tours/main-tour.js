import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

import {
	makeTour,
	Tour,
	Step,
	ButtonRow,
	Next,
	Quit,
	Continue,
	Link,
} from 'layout/guided-tours/config-elements';
import {
	isNewUser,
	isEnabled,
	selectedSiteIsPreviewable,
	selectedSiteIsCustomizable,
	previewIsNotShowing,
	previewIsShowing,
} from 'state/ui/guided-tours/contexts';
import { getScrollableSidebar } from 'layout/guided-tours/positioning';
import scrollTo from 'lib/scroll-to';

const scrollSidebarToTop = () =>
	scrollTo( { y: 0, container: getScrollableSidebar() } );

export const MainTour = makeTour(
	<Tour name="main" version="20160601" path="/" when={ and( isNewUser, isEnabled( 'guided-tours/main' ) ) }>
		<Step name="init" placement="right">
			<p>
				{
					translate( "{{strong}}Need a hand?{{/strong}} We'd love to show you around the place," +
											'and give you some ideas for what to do next.',
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<ButtonRow>
				<Next step="my-sites">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</ButtonRow>
		</Step>

		<Step name="my-sites"
			target="my-sites"
			placement="below"
			arrow="top-left"
		>
			<p>
				{
					translate( "{{strong}}First things first.{{/strong}} Up here, you'll find tools for managing " +
											"your site's content and design.",
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<Continue icon="my-sites" target="my-sites" step="sidebar" click />
		</Step>

		<Step name="sidebar"
			target="sidebar"
			arrow="left-middle"
			placement="beside"
		>
			<p>
				{ translate( 'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ) }
			</p>
			<ButtonRow>
				<Next step="click-preview" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="click-preview"
			target="site-card-preview"
			arrow="top-left"
			placement="below"
			when={ selectedSiteIsPreviewable }
			scrollContainer=".sidebar__region"
		>
			<p>
				{
					translate( "This shows your currently {{strong}}selected site{{/strong}}'s name and address.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<Continue step="in-preview" target="site-card-preview" click>
				{
					translate( "Click {{strong}}your site's name{{/strong}} to continue.", {
						components: {
							strong: <strong />,
						},
					} )
				}
			</Continue>
		</Step>

		<Step name="in-preview"
			placement="center"
			when={ selectedSiteIsPreviewable }
		>
			<p>
				{
					translate( "This is your site's {{strong}}Preview{{/strong}}. From here you can see how your site looks to others.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<ButtonRow>
				<Next step="close-preview" />
				<Quit />
				<Continue step="close-preview" when={ previewIsNotShowing } hidden />
			</ButtonRow>
		</Step>

		<Step name="close-preview"
			target="web-preview__close"
			arrow="left-top"
			placement="beside"
			when={ and( selectedSiteIsPreviewable, previewIsShowing ) }
		>
			<p>
				{ translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ) }
			</p>
			<Continue step="themes" icon="cross-small" target="web-preview__close" when={ previewIsNotShowing } />
		</Step>

		<Step name="themes"
			target="themes"
			arrow="top-left"
			placement="below"
			when={ selectedSiteIsCustomizable }
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<p>
				{
					translate( 'Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}} ' +
											"your theme's colors, fonts, and more.",
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<ButtonRow>
				<Next step="finish" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step name="finish" placement="center">
			<p>
				{
					translate( "{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<ButtonRow>
				<Quit onClick={ scrollSidebarToTop } primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</ButtonRow>
			<Link href="https://learn.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
