import React from 'react';

import { getSelectedSite, isPreviewShowing } from 'state/ui/selectors';
import { isNewUser } from 'state/ui/guided-tours/selectors';
import { Tour,
	Step,
	Next,
	Quit,
	ClickToContinue,
	Link,
} from 'layout/guided-tours';

const selectedSiteIsPreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

const selectedSiteIsCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

const previewIsNotShowing = state =>
	! isPreviewShowing( state );

export const MainTour = ( { translate } ) => (
	<Tour name="main" version="20160601" path="/" context={ isNewUser }>
		<Step name="init" placement="right" next="my-sites">
			{
				translate( "{{strong}}Need a hand?{{/strong}} We'd love to show you around the place," +
										'and give you some ideas for what to do next.',
					{
						components: {
							strong: <strong />,
						}
					} )
			}
			<Next>{ translate( "Let's go!" ) }</Next>
			<Quit>{ translate( 'No thanks.' ) }</Quit>
		</Step>

		<Step name="my-sites"
			target="my-sites"
			placement="below"
			arrow="top-left"
			next="sidebar"
		>
			{
				translate( "{{strong}}First things first.{{/strong}} Up here, you'll find tools for managing " +
										"your site's content and design.",
					{
						components: {
							strong: <strong />,
						}
					} )
			}
			<ClickToContinue icon="my-sites" target="my-sites" />
		</Step>

		<Step name="sidebar"
			target="sidebar"
			arrow="left-middle"
			placement="beside"
			next="click-preview"
		>
			{ translate( 'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ) }
			<Next/>
			<Quit/>
		</Step>

		<Step name="click-preview"
			target="site-card-preview"
			arrow="top-left"
			placement="below"
			context={ selectedSiteIsPreviewable }
			next="in-preview"
		>
			{
				translate( "This shows your currently {{strong}}selected site{{/strong}}'s name and address.", {
					components: {
						strong: <strong />,
					}
				} )
			}
			<ClickToContinue>
				{ translate( "your site's name", {
					context: "Click your site's name to continue.",
				} ) }
			</ClickToContinue>
		</Step>

		<Step name="in-preview"
			placement="center"
			context={ selectedSiteIsPreviewable }
			continueWhen={ previewIsNotShowing }
			next="close-preview"
		>
			{
				translate( "This is your site's {{strong}}Preview{{/strong}}. From here you can see how your site looks to others.", {
					components: {
						strong: <strong />,
					}
				} )
			}
			<Next/>
			<Quit/>
		</Step>

		<Step name="close-preview"
			target="web-preview__close"
			arrow="left-top"
			context={ selectedSiteIsPreviewable }
			continueWhen={ previewIsNotShowing }
			next="themes"
		>
			{ translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ) }
			<ClickToContinue target="web-preview__close" icon="cross-small" />
		</Step>

		<Step name="themes"
			target="themes"
			arrow="top-left"
			placement="below"
			context={ selectedSiteIsCustomizable }
			next="finish"
		>
			{
				translate( 'Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}}' +
										"your theme's colors, fonts, and more.",
					{
						components: {
							strong: <strong />,
						}
					} )
			}
		</Step>

		<Step name="finish"
			placement="center"
		>
			{
				translate( "{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.", {
					components: {
						strong: <strong />,
					}
				} )
			}
			<Link href="https://lean.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
