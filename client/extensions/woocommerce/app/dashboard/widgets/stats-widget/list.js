/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import List from 'woocommerce/app/store-stats/store-stats-list';
import Module from 'woocommerce/app/store-stats/store-stats-module';

const StatsWidgetList = ( {
	site,
	translate,
	unit,
	values,
	statSlug,
	statType,
	emptyMessage,
	fetchedData,
	query,
} ) => {
	return (
		<div className="stats-widget__box-contents stats-type-list">
			<Module
				siteId={ site.ID }
				emptyMessage={ emptyMessage }
				query={ query }
				statType={ statType }
				fetchedData={ fetchedData }
			>
				<List
					siteId={ site.ID }
					values={ values }
					query={ query }
					statType={ statType }
					fetchedData={ fetchedData }
				/>
			</Module>

			{ fetchedData.length > 0 && (
				<div className="stats-widget__more">
					<a href={ getLink( `/store/stats/${ statSlug }/${ unit }/:site`, site ) }>
						{ translate( 'More' ) }
					</a>
				</div>
			) }
		</div>
	);
};

StatsWidgetList.propTypes = {
	site: PropTypes.shape( {
		id: PropTypes.number,
		slug: PropTypes.string,
	} ),
	unit: PropTypes.string.isRequired,
	values: PropTypes.array.isRequired,
	statSlug: PropTypes.string.isRequired,
	statType: PropTypes.string.isRequired,
	emptyMessage: PropTypes.string.isRequired,
	query: PropTypes.object,
	fetchedData: PropTypes.array,
};

export default localize( StatsWidgetList );
