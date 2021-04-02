/**
 * External dependencies
 */
import React, { ReactElement, useContext } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */

import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import Count from 'calypso/components/count';
import Search from 'calypso/components/search';
import UrlSearch from 'calypso/lib/url-search';
import { getLicenseCounts } from 'calypso/state/partner-portal/licenses/selectors';
import { internalToPublicLicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	doSearch: ( query: string ) => void;
	getSearchOpen: () => boolean;
}

function LicenseStateFilter( { doSearch }: Props ): ReactElement {
	const translate = useTranslate();
	const { filter, search } = useContext( LicenseListContext );
	const counts = useSelector( getLicenseCounts );
	const basePath = '/partner-portal/';

	const navItems = [
		{
			key: LicenseFilter.NotRevoked,
			label: translate( 'All Active' ),
		},
		{
			key: LicenseFilter.Detached,
			label: translate( 'Unassigned' ),
		},
		{
			key: LicenseFilter.Attached,
			label: translate( 'Assigned' ),
		},
		{
			key: LicenseFilter.Revoked,
			label: translate( 'Revoked' ),
		},
	].map( ( navItem ) => ( {
		...navItem,
		count: counts[ navItem.key ] || 0,
		selected: filter === navItem.key,
		path: basePath + internalToPublicLicenseFilter( navItem.key ),
		children: navItem.label,
	} ) );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];

	return (
		<SectionNav
			selectedText={
				<span>
					{ selectedItem.label }
					<Count count={ selectedItem.count } compact={ true } />
				</span>
			}
			selectedCount={ selectedItem.count }
			className="license-state-filter"
		>
			<NavTabs
				label={ translate( 'State' ) }
				selectedText={ selectedItem.label }
				selectedCount={ selectedItem.count }
			>
				{ navItems.map( ( props ) => (
					<NavItem { ...props } compactCount={ true } />
				) ) }
			</NavTabs>

			<Search
				pinned
				fitsContainer
				initialValue={ search }
				onSearch={ doSearch }
				placeholder={ translate( 'Search licenses' ) }
				delaySearch={ true }
			/>
		</SectionNav>
	);
}

export default UrlSearch( LicenseStateFilter );
