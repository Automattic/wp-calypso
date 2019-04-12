/** @format */

/**
 * External dependencies
 */

import React, { Fragment } from 'react';
import Gridicon from 'gridicons';

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
} from 'layout/guided-tours/config-elements';
import { hasAnalyticsEventFired } from 'state/ui/guided-tours/contexts';

const anyThemeMoreButtonClicked = hasAnalyticsEventFired( 'calypso_themeshowcase_theme_click' );

export const DesignShowcaseWelcomeTour = makeTour(
	<Tour { ...meta }>
		<Step name="init" placement="right" next="search" style={ { animationDelay: '2s' } }>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'On this page, you can explore our many themes. ' +
								"Want to learn how to find the design that fits the site you're building?"
						) }
					</p>
					<ButtonRow>
						<Next step="search">{ translate( "Let's go!" ) }</Next>
						<Quit>{ translate( 'No, thanks.' ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="search"
			target=".themes-magic-search-card .search__icon-navigation"
			arrow="top-left"
			placement="below"
			next="theme-options"
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Search for your ideal theme by feature, look, or topic — ' +
								'you can use words like "business", "photography", or "food".'
						) }
					</p>
					<ButtonRow>
						<Next step="theme-options" />
						<Quit />
					</ButtonRow>
				</Fragment>
			) }
		</Step>

		<Step
			name="theme-options"
			target=".card.theme:nth-child(4) .theme__more-button"
			placement="beside"
			next="finish"
			scrollContainer="body"
			shouldScrollTo
		>
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'Scroll down to discover more themes. Found anything you like? ' +
								'Try clicking the three dots — {{icon/}} — for more theme options.',
							{
								components: { icon: <Gridicon icon="ellipsis" /> },
							}
						) }
					</p>
					<Continue
						icon="ellipsis"
						step="finish"
						target=".card.theme:nth-child(4) .theme__more-button"
						when={ anyThemeMoreButtonClicked }
					/>
				</Fragment>
			) }
		</Step>

		<Step name="finish" target=".popover" placement="beside">
			{ ( { translate } ) => (
				<Fragment>
					<p>
						{ translate(
							'This menu lets you preview and set up any theme, or learn more about it.'
						) }
					</p>
					<ButtonRow>
						<Quit primary>{ translate( "We're all done!" ) }</Quit>
					</ButtonRow>
				</Fragment>
			) }
		</Step>
	</Tour>
);
