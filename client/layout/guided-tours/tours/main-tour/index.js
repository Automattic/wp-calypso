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
	Link,
} from 'calypso/layout/guided-tours/config-elements';
import {
	isSelectedSitePreviewable,
	isSelectedSiteCustomizable,
} from 'calypso/state/guided-tours/contexts';
import { getScrollableSidebar } from 'calypso/layout/guided-tours/positioning';
import scrollTo from 'calypso/lib/scroll-to';
import { ViewSiteButton } from 'calypso/layout/guided-tours/button-labels';

const scrollSidebarToTop = () => scrollTo( { y: 0, container: getScrollableSidebar() } );

// Note that this tour checks for a non-existent feature flag so it never gets triggered.
// We use this tour as an example and playground only.
export const MainTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" placement="right" style={ { animationDelay: '2s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"{{strong}}Need a hand?{{/strong}} We'd love to show you around the place, " +
								'and give you some ideas for what to do next.',
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Next step="my-sites">{ translate( "Let's go!" ) }</Next>
						<Quit>{ translate( 'No thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="my-sites" target="my-sites" placement="below" arrow="top-left">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"{{strong}}First things first.{{/strong}} Up here, you'll find tools for managing " +
								"your site's content and design.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<Continue click icon="my-sites" step="sidebar" target="my-sites" />
				</Fragment>
			) }
		</Step>

		<Step name="sidebar" target="sidebar" arrow="left-middle" placement="beside">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.'
						) }
					</p>
					<ButtonRow>
						<Next step="click-preview" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="click-preview"
			target="sitePreview"
			arrow="top-left"
			placement="below"
			when={ isSelectedSitePreviewable }
			scrollContainer=".sidebar__region"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'Want to take a look at your site?' ) }</p>
					<Continue click step="view-site" target="sitePreview">
						{ translate( 'Click {{viewSiteButton/}} to continue.', {
							components: {
								viewSiteButton: <ViewSiteButton />,
							},
						} ) }
					</Continue>
					<ButtonRow>
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="view-site" placement="center" when={ isSelectedSitePreviewable }>
			{ ( { translate } ) => (
				<Fragment>
					<p>{ translate( 'This is what your site looks like to visitors.' ) }</p>
					<ButtonRow>
						<Next step="themes" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="themes"
			target="themes"
			arrow="top-left"
			placement="below"
			when={ isSelectedSiteCustomizable }
			scrollContainer=".sidebar__region"
			shouldScrollTo
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Change your {{strong}}Theme{{/strong}} to choose a new layout, or {{strong}}Customize{{/strong}} ' +
								"your theme's colors, fonts, and more.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Next step="finish" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step name="finish" placement="center">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							"{{strong}}That's it!{{/strong}} Now that you know a few of the basics, feel free to wander around.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
					<ButtonRow>
						<Quit onClick={ scrollSidebarToTop } primary>
							{ translate( "We're all done!" ) }
						</Quit>
					</ButtonRow>
					<Link href="https://learn.wordpress.com">
						{ translate( 'Learn more about WordPress.com' ) }
					</Link>
				</Fragment>
			) }
		</Step>
	</Tour>
);
