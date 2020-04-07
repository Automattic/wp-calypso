/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import StatsBanners from 'my-sites/stats/stats-banners';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const cardComponents = {
	'home-banner-legacy-stats-banners': StatsBanners,
};

const Upsells = ( { cards, primary, siteId, slug } ) => {
	const componentProps = {
		primary,
		siteId,
		slug,
	};
	return (
		<>
			{ cards &&
				cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement(
							cardComponents[ card ],
							card === 'home-banner-legacy-stats-banners'
								? { key: index, ...componentProps }
								: { key: index }
						)
				) }
		</>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const isChecklistComplete = isSiteChecklistComplete( state, siteId );
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );

	return {
		primaryButton: isChecklistComplete && ! siteIsUnlaunched,
		siteId,
		slug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( Upsells );
