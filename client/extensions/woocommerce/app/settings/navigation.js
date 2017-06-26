/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';

export const SettingsNavigation = ( {
	site,
	activeSection,
	translate,
} ) => {
	const items = [
		{
			id: 'payments',
			path: '/store/settings/payments/:site',
			title: translate( 'Payments' ),
		},
		{
			id: 'shipping',
			path: '/store/settings/shipping/:site',
			title: translate( 'Shipping' ),
		},
		{
			id: 'tax',
			path: '/store/settings/tax/:site',
			title: translate( 'Tax' ),
		},
	];

	return (
		<SectionNav>
			<NavTabs>
				{ items.map( ( { id, path, title } ) => {
					const link = getLink( path, site );
					return (
						<NavItem selected={ activeSection === id } key={ id } path={ link }>
							{ title }
						</NavItem>
					);
				} ) }
			</NavTabs>
		</SectionNav>
	);
};

SettingsNavigation.propTypes = {
	site: PropTypes.shape( {
		ID: PropTypes.number,
		slug: PropTypes.string,
	} ),
	activeSection: PropTypes.string,
	translate: PropTypes.func,
};

export default connect(
	( state ) => {
		return {
			site: getSelectedSiteWithFallback( state ),
		};
	},
)( localize( SettingsNavigation ) );
