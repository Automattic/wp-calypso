/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import page from 'page';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import { Button, Card } from '@automattic/components';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';

export const Container = styled.div`
	margin: 25px;
	padding: 25px;
`;

export default function MarketplaceTest() {
	const selectedSite = useSelector( getSelectedSite );
	const marketplacePages = [
		{ name: 'Plugin Details Page', path: '/marketplace/product/details/wordpress-seo' },
		{ name: 'Loading Page', path: '/marketplace/product/setup' },
		{ name: 'Domains Page', path: '/marketplace/domain' },
		{ name: 'Thank You Page', path: '/marketplace/thank-you' },
	];

	return (
		<Container>
			<SidebarNavigation />
			<CardHeading tagName="h1" size={ 32 }>
				Marketplace Test Page With Links For Various Pages
			</CardHeading>
			<CardHeading tagName="h1" size={ 21 }>
				Currrent Site : { selectedSite?.domain }
			</CardHeading>
			{ marketplacePages.map( ( p ) => {
				const path = `${ p.path }${ selectedSite?.domain ? `/${ selectedSite.domain }` : '' }`;
				return (
					<Card key={ path }>
						<Button onClick={ () => page( path ) }>{ p.name }</Button>
					</Card>
				);
			} ) }
		</Container>
	);
}
