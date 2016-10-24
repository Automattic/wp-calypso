import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

import {
	makeTour,
	Tour,
	Step,
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
import Gridicon from 'components/gridicon';
import scrollTo from 'lib/scroll-to';

const scrollSidebarToTop = () =>
	scrollTo( { y: 0, container: getScrollableSidebar() } );

export const MainTour = makeTour(
	<Tour name="main" version="20160601" path="/" when={ and( isNewUser, isEnabled( 'guided-tours/main' ) ) }>
		<Step name="init" placement="right" className="guided-tours__step-first">
			<p className="guided-tours__step-text">
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
			<div className="guided-tours__choice-button-row">
				<Next step="my-sites">{ translate( "Let's go!" ) }</Next>
				<Quit>{ translate( 'No thanks.' ) }</Quit>
			</div>
		</Step>

		<Step name="my-sites"
			target="my-sites"
			placement="below"
			arrow="top-left"
		>
			<p className="guided-tours__step-text">
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
			<p className="guided-tours__actionstep-instructions">
				<Continue icon="my-sites" target="my-sites" step="sidebar" click>
					{
						translate( 'Click the {{GridIcon/}} to continue.', {
							components: {
								GridIcon: <Gridicon icon="my-sites" size={ 24 } />,
							}
						} )
					}
				</Continue>
			</p>
		</Step>

		<Step name="sidebar"
			target="sidebar"
			arrow="left-middle"
			placement="beside"
		>
			<p className="guided-tours__step-text">
				{ translate( 'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ) }
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="click-preview" />
				<Quit />
			</div>
		</Step>

		<Step name="click-preview"
			className="guided-tours__step-action"
			target="site-card-preview"
			arrow="top-left"
			placement="below"
			when={ selectedSiteIsPreviewable }
			scrollContainer=".sidebar__region"
		>
			<p className="guided-tours__step-text">
				{
					translate( "This shows your currently {{strong}}selected site{{/strong}}'s name and address.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="in-preview" target="site-card-preview" click>
					{
						translate( "Click {{strong}}your site's name{{/strong}} to continue.", {
							components: {
								strong: <strong />,
							},
						} )
					}
				</Continue>
			</p>
		</Step>

		<Step name="in-preview"
			placement="center"
			when={ selectedSiteIsPreviewable }
		>
			<p className="guided-tours__step-text">
				{
					translate( "This is your site's {{strong}}Preview{{/strong}}. From here you can see how your site looks to others.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next step="close-preview" />
				<Quit />
				<Continue step="close-preview" when={ previewIsNotShowing } hidden />
			</div>
		</Step>

		<Step name="close-preview"
			className="guided-tours__step-action"
			target="web-preview__close"
			arrow="left-top"
			placement="beside"
			when={ and( selectedSiteIsPreviewable, previewIsShowing ) }
		>
			<p className="guided-tours__step-text">
				{ translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ) }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue step="themes" target="web-preview__close" when={ previewIsNotShowing }>
					{
						translate( 'Click the {{GridIcon/}} to continue.', {
							components: {
								GridIcon: <Gridicon icon="cross-small" size={ 24 } />,
							}
						} )
					}
				</Continue>
			</p>
		</Step>

		<Step name="themes"
			target="themes"
			arrow="top-left"
			placement="below"
			when={ selectedSiteIsCustomizable }
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			<p className="guided-tours__step-text">
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
			<div className="guided-tours__choice-button-row">
				<Next step="finish" />
				<Quit />
			</div>
		</Step>

		<Step name="finish"
			placement="center"
			className="guided-tours__step-finish"
		>
			<p className="guided-tours__step-text">
				{
					translate( "{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.", {
						components: {
							strong: <strong />,
						}
					} )
				}
			</p>
			<div className="guided-tours__single-button-row">
				<Quit onClick={ scrollSidebarToTop } primary>
					{ translate( "We're all done!" ) }
				</Quit>
			</div>
			<Link href="https://learn.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
