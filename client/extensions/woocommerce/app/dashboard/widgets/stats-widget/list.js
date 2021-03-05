/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import List from 'woocommerce/app/store-stats/store-stats-list';
import Module from 'woocommerce/app/store-stats/store-stats-module';

const StatsWidgetList = ( {
	site,
	values,
	statType,
	emptyMessage,
	fetchedData,
	query,
	viewLink,
	viewText,
	onViewClick,
} ) => {
	const onView = () => {
		if ( onViewClick ) {
			onViewClick( statType );
		}
	};

	let viewMarkup;
	if ( viewLink && fetchedData && Array.isArray( fetchedData ) && fetchedData.length ) {
		viewMarkup = (
			<div className="stats-widget__more">
				<a href={ viewLink } onClick={ onView }>
					{ viewText }
				</a>
			</div>
		);
	}

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

			{ viewMarkup }
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
	statType: PropTypes.string.isRequired,
	emptyMessage: PropTypes.string.isRequired,
	query: PropTypes.object,
	fetchedData: PropTypes.array,
	viewLink: PropTypes.string.isRequired,
	viewText: PropTypes.string.isRequired,
	onViewClick: PropTypes.func,
};

export default StatsWidgetList;
