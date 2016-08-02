/** @ssr-ready **/

import React from 'react';

import { getSelectedSite, isPreviewShowing } from 'state/ui/selectors';
import {
	makeTour,
	Tour,
	Step,
	Next,
	Quit,
	Continue,
	Link,
} from 'layout/guided-tours/config-elements';
import { translate } from 'i18n-calypso';

// FIXME(mcsf): This is all kinds of wrong, but circular dependencies are
// breaking `relevantFeatures`. The fix, IMO, is to split selectors into
// separate files, as described in #6914
export const isNewUser = () => true;

const selectedSiteIsPreviewable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_previewable;

const selectedSiteIsCustomizable = state =>
	getSelectedSite( state ) && getSelectedSite( state ).is_customizable;

const previewIsNotShowing = state =>
	! isPreviewShowing( state );

const context = state =>
	true || isNewUser( state );

const and = ( ...args ) => state =>
	args.every( fn => !! fn( state ) );

export const MainTour = makeTour(
	<Tour name="main" version="20160601" path="/" context={ context }>
		<Step name="init" placement="right" next="my-sites" className="guided-tours__step-first">
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
			next="sidebar"
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
				<Continue icon="my-sites" target="my-sites" click/>
			</p>
		</Step>

		<Step name="sidebar"
			target="sidebar"
			arrow="left-middle"
			placement="beside"
			next="click-preview"
		>
			<p className="guided-tours__step-text">
				{ translate( 'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.' ) }
			</p>
			<div className="guided-tours__choice-button-row">
				<Next/>
				<Quit/>
			</div>
		</Step>

		<Step name="click-preview"
			className="guided-tours__step-action"
			target="site-card-preview"
			arrow="top-left"
			placement="below"
			context={ selectedSiteIsPreviewable }
			next="in-preview"
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
				<Continue target="site-card-preview" click>
					{ translate( "your site's name", {
						context: "Click your site's name to continue.",
					} ) }
				</Continue>
			</p>
		</Step>

		<Step name="in-preview"
			placement="center"
			context={ selectedSiteIsPreviewable }
			next="close-preview"
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
				<Next/>
				<Quit/>
				<Continue context={ previewIsNotShowing } hidden />
			</div>
		</Step>

		<Step name="close-preview"
			className="guided-tours__step-action"
			target="web-preview__close"
			arrow="left-top"
			placement="beside"
			context={ and( selectedSiteIsPreviewable, isPreviewShowing ) }
			next="themes"
		>
			<p className="guided-tours__step-text">
				{ translate( 'Take a look at your site — and then close the site preview. You can come back here anytime.' ) }
			</p>
			<p className="guided-tours__actionstep-instructions">
				<Continue target="web-preview__close" icon="cross-small" context={ previewIsNotShowing } />
			</p>
		</Step>

		<Step name="themes"
			target="themes"
			arrow="top-left"
			placement="below"
			context={ selectedSiteIsCustomizable }
			next="finish"
			scrollContainer=".sidebar__region"
		>
			<p className="guided-tours__step-text">
				{
					translate( 'Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}}' +
											"your theme's colors, fonts, and more.",
						{
							components: {
								strong: <strong />,
							}
						} )
				}
			</p>
			<div className="guided-tours__choice-button-row">
				<Next/>
				<Quit/>
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
				<Quit primary>{ translate( "We're all done!" ) }</Quit>
			</div>
			<Link href="https://lean.wordpress.com">
				{ translate( 'Learn more about WordPress.com' ) }
			</Link>
		</Step>
	</Tour>
);
