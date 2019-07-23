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
	header: ReactNode;
	headerClick: null | Function;
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
	headerClick,
	cards,
} ) => {
	return (
		<Fragment>
			<PageViewTracker path={ viewTrackerPath } title={ viewTrackerTitle } />
			<ActionPanel>
				<div>{ header }</div>
				<div>{ headerClick }</div>
				<div>{ selectedSiteSlug }</div>
			</ActionPanel>
			<div className="layout-header-two-col__list">{ map( cards, renderCards ) }</div>
		</Fragment>
	);
};

export default connect( state => ( {
	selectedSiteSlug: getSelectedSiteSlug( state ),
} ) )( LayoutHeaderTwoCol );
