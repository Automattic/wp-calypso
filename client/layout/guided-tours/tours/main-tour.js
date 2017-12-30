/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

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
	Continue,
	Link,
} from 'layout/guided-tours/config-elements';
import {
	isNewUser,
	isEnabled,
	isSelectedSitePreviewable,
	isSelectedSiteCustomizable,
} from 'state/ui/guided-tours/contexts';
import { getScrollableSidebar } from 'layout/guided-tours/positioning';
import scrollTo from 'lib/scroll-to';

const scrollSidebarToTop = () => scrollTo( { y: 0, container: getScrollableSidebar() } );
const ViewSiteButtonLabel = translate( 'View Site' );

// note that this tour checks for a non-existent feature flag.
// this is kept as an example, while making sure it never gets triggered
export const MainTour = makeTour(
	<Tour
		name="main"
		version="20160601"
		path="/"
		when={ and( isNewUser, isEnabled( 'guided-tours/main' ) ) }
	>
		<Step name="init" placement="right">
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
		</Step>

		<Step name="my-sites" target="my-sites" placement="below" arrow="top-left">
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
		</Step>

		<Step name="sidebar" target="sidebar" arrow="left-middle" placement="beside">
			<p>
				{ translate(
					'This menu lets you navigate around, and will adapt to give you the tools you need when you need them.'
				) }
			</p>
			<ButtonRow>
				<Next step="click-preview" />
				<Quit />
			</ButtonRow>
		</Step>

		<Step
			name="click-preview"
			target="sitePreview"
			arrow="top-left"
			placement="below"
			when={ isSelectedSitePreviewable }
			scrollContainer=".sidebar__region"
		>
			<p>{ translate( 'Want to take a look at your site?' ) }</p>
			<Continue click step="view-site" target="sitePreview">
				{ translate( 'Click {{ViewSiteButton/}} to continue.', {
					components: {
						ViewSiteButton: <strong>{ ViewSiteButtonLabel }</strong>,
					},
				} ) }
			</Continue>
		</Step>

		<Step name="view-site" placement="center" when={ isSelectedSitePreviewable }>
			<p>{ translate( 'This is what your site looks like to visitors.' ) }</p>
			<ButtonRow>
				<Next step="themes" />
				<Quit />
			</ButtonRow>
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
		</Step>

		<Step name="finish" placement="center">
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
		</Step>
	</Tour>
);
