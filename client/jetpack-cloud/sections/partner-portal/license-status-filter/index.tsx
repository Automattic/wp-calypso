/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { StatusFilter } from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import Search from 'calypso/components/search';
import UrlSearch from 'calypso/lib/url-search';

interface Props {
	statusFilter?: StatusFilter;
	search?: string;
	doSearch: ( query: string ) => void;
	getSearchOpen: () => boolean;
}

const LicenseStatusFilter: React.FC< Props > = ( props ) => {
	const translate = useTranslate();
	const basePath = '/partner-portal/';

	const navItems = [
		{ key: 'all', label: translate( 'All Active' ), count: 4 },
		{
			key: 'detached',
			label: translate( 'Detached' ),
			count: 2,
		},
		{
			key: 'attached',
			label: translate( 'Attached' ),
			count: 7,
		},
		{ key: 'revoked', label: translate( 'Revoked' ), count: 5 },
	].map( ( navItem ) => ( {
		...navItem,
		selected: props.statusFilter === navItem.key,
		path: basePath + ( 'all' !== navItem.key ? navItem.key : '' ),
		children: navItem.label,
	} ) );

	const selectedItem = find( navItems, 'selected' ) || navItems[ 0 ];

	return (
		<SectionNav
			selectedText={ selectedItem.label }
			selectedCount={ selectedItem.count }
			classname={ classnames( 'license-status-filter', { 'search-open': props.getSearchOpen() } ) }
		>
			<NavTabs
				label={ translate( 'Testing' ) }
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
};

export default UrlSearch( LicenseStatusFilter );
