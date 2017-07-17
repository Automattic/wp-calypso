/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';

const StoreStatsNavigationTabs = props => {
	const { label, slug, type, unit, units } = props;
	return (
		<NavTabs label={ label }>
			{ Object.keys( units ).map( key => (
				<NavItem
					key={ key }
					path={ `/store/stats/${ type }/${ key }/${ slug }` }
					selected={ unit === key }
				>
					{ units[ key ].title }
				</NavItem>
			) ) }
		</NavTabs>
	);
};

StoreStatsNavigationTabs.propTypes = {
	label: PropTypes.string,
	slug: PropTypes.string,
	type: PropTypes.string,
	unit: PropTypes.string,
	units: PropTypes.object,
};

export default localize( StoreStatsNavigationTabs );
