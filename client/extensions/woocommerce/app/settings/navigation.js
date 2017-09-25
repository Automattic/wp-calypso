/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';

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
			id: 'taxes',
			path: '/store/settings/taxes/:site',
			title: translate( 'Taxes' ),
		},
	];

	const section = find( items, { id: activeSection } );
	return (
		<SectionNav selectedText={ section && section.title }>
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
