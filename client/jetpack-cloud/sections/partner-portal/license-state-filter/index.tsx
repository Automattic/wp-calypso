/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { find } from 'lodash';

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

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseFilter: LicenseFilter;
	search: string;
	doSearch: ( query: string ) => void;
	getSearchOpen: () => boolean;
}

function LicenseStateFilter( props: Props ): ReactElement {
	const translate = useTranslate();
	const basePath = '/partner-portal/';

	const navItems = [
		{ key: LicenseFilter.All, label: translate( 'All Active' ), count: 4 },
		{
			key: LicenseFilter.Detached,
			label: translate( 'Detached' ),
			count: 2,
		},
		{
			key: LicenseFilter.Attached,
			label: translate( 'Attached' ),
			count: 7,
		},
		{ key: LicenseFilter.Revoked, label: translate( 'Revoked' ), count: 5 },
	].map( ( navItem ) => ( {
		...navItem,
		selected: props.licenseFilter === navItem.key,
		path: basePath + ( 'all' !== navItem.key ? navItem.key : '' ),
		children: navItem.label,
	} ) );

	const selectedItem = find( navItems, 'selected' ) || navItems[ 0 ];

	return (
		<SectionNav
			selectedText={
				<span>
					{ selectedItem.label }
					<Count count={ selectedItem.count } />
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
					<NavItem { ...props } />
				) ) }
			</NavTabs>
			<Search
				pinned
				fitsContainer
				initialValue={ props.search }
				onSearch={ props.doSearch }
				placeholder={ translate( 'Search licenses' ) }
				delaySearch={ true }
			/>
		</SectionNav>
	);
}

export default UrlSearch( LicenseStateFilter );
