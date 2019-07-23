/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Fragment, FunctionComponent, ReactNode } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelCta from 'components/action-panel/cta';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Types
 */
import * as T from 'types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	selectedSiteSlug: T.SiteSlug | null;
	viewTrackerPath: string; // /marketing/tools/:site
	viewTrackerTitle: string; // Marketing > Tools
	header: {
		title: string;
		desc: string;
		iconSrc: string;
		iconWidth: '170' | string;
		iconHeight: '143' | string;
		alt: string;
		buttonLabel: string;
		buttonHref: string;
	};
	cards: ReactNode[];
}

const renderCards: ( card: ReactNode ) => ReactNode = function( card: ReactNode ): ReactNode {
	return (
		<Card title={ card.title } description={ card.description } imagePath={ card.icon }>
			<Button compact onClick={ card.buttonClick } href={ card.buttonHref } target="_blank">
				{ card.buttonLabel }
			</Button>
		</Card>
	);
};

export const LayoutHeaderTwoCol: FunctionComponent< Props > = ( {
	selectedSiteSlug,
	viewTrackerPath,
	viewTrackerTitle,
	header,
	cards,
} ) => {
	return (
		<Fragment>
			<PageViewTracker path={ viewTrackerPath } title={ viewTrackerTitle } />
			<ActionPanel>
				<ActionPanelBody>
					<ActionPanelFigure inlineBodyText={ true } align="left">
						<img
							src={ header.iconSrc }
							width={ header.iconWidth }
							height={ header.iconHeight }
							alt={ header.alt }
						/>
					</ActionPanelFigure>
					<ActionPanelTitle>{ header.title }</ActionPanelTitle>
					<p>
						{ header.description }
						{ `remove this ${ selectedSiteSlug }` }
					</p>
					<ActionPanelCta>
						<Button className="layout-header-two-col__header-button" href={ header.buttonHref }>
							{ header.buttonLabel }
						</Button>
					</ActionPanelCta>
				</ActionPanelBody>
			</ActionPanel>
			<div className="layout-header-two-col__list">{ map( cards, renderCards ) }</div>
		</Fragment>
	);
};

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( LayoutHeaderTwoCol );
