/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';

export const StoreSettings = ( {
	siteId,
	siteSlug,
	translate,
} ) => {
	const pathSuffix = siteSlug ? '/' + siteSlug : '';
	const filters = [];

	filters.push( {
		id: 'payments',
		route: '/store/settings/payments' + pathSuffix,
		title: translate( 'Payments' ),
	} );

	filters.push( {
		id: 'shipping',
		route: '/store/settings/shipping' + pathSuffix,
		title: translate( 'Shipping' ),
	} );

	filters.push( {
		id: 'tax',
		route: '/store/settings/tax' + pathSuffix,
		title: translate( 'Tax' ),
	} );

	filters.push( {
		id: 'display',
		route: '/store/settings/display' + pathSuffix,
		title: translate( 'Display' ),
	} );

	filters.push( {
		id: 'emails',
		route: '/store/settings/emails' + pathSuffix,
		title: translate( 'Emails' ),
	} );


	return (
		<SectionNav>
			<NavTabs>
				{ filters.map( ( { id, route, title } ) => (
					<NavItem className={ route } key={ id } path={ route }>
						{ title }
					</NavItem>
				) ) }
			</NavTabs>
		</SectionNav>
	);
};

StoreSettings.propTypes = {
	siteId: PropTypes.number,
	siteSlug: PropTypes.string,
	translate: PropTypes.func,
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
)( localize( StoreSettings ) );
