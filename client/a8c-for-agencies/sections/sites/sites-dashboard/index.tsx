import page from '@automattic/calypso-router';
import React, { useContext, useEffect } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY } from '../constants';
import SitesDashboardContext from '../sites-dashboard-context';

export default function SitesDashboard() {
	const { hideListing, setHideListing } = useContext( SitesDashboardContext );
	const { selectedCategory: category, setSelectedCategory: setCategory } =
		useContext( SitesDashboardContext );

	const { selectedSiteUrl, setSelectedSiteUrl } = useContext( SitesDashboardContext );
	const { selectedSiteFeature, setSelectedSiteFeature } = useContext( SitesDashboardContext );

	const changeCurrentSitePreview = () => {
		const randomSite = `example-${ Math.floor( Math.random() * 1000 ) }.com`;

		setSelectedSiteUrl( randomSite );
	};

	const changeCurrentSiteFeature = () => {
		const randomNumber = Math.floor( Math.random() * 1000 );

		setSelectedSiteFeature( 'Feature_' + randomNumber );
	};

	const closePreview = () => {
		setSelectedSiteUrl( '' );
		setHideListing( false );
	};

	const currentPage = 1;

	useEffect( () => {
		// We need a category in the URL if we have a selected site
		if ( selectedSiteUrl && ! category ) {
			setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		}

		if ( category && selectedSiteUrl && selectedSiteFeature ) {
			page.replace( '/sites/' + category + '/' + selectedSiteUrl + '/' + selectedSiteFeature );
		} else if ( category && selectedSiteUrl ) {
			page.replace( '/sites/' + category + '/' + selectedSiteUrl );
		} else if ( category ) {
			page.replace( '/sites/' + category );
		} else {
			page.replace( '/sites' );
		}
	}, [ selectedSiteUrl, selectedSiteFeature, category, setCategory ] );

	return (
		<Layout title="Sites" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>Sites</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div style={ { display: 'flex' } }>
					<div style={ { border: '1px solid black', flex: 1 } }>{ currentPage }</div>
					<div
						style={ {
							border: '1px solid red',
							flex: 1,
							display: hideListing ? 'none' : 'block',
						} }
					>
						Site List
						<br />
						Category: { category }
						<br />
						<button className="button" onClick={ changeCurrentSitePreview }>
							Change Site
						</button>
					</div>
					<div
						style={ {
							border: '1px solid green',
							flex: 1,
							display: selectedSiteUrl ? 'block' : 'none',
						} }
					>
						Selected Site: { selectedSiteUrl }
						<br />
						Selected Feature: { selectedSiteFeature }
						<br />
						<br />
						<button className="button" onClick={ changeCurrentSiteFeature }>
							Change Feature
						</button>
						<br />
						<br />
						<button className="button" onClick={ closePreview }>
							ClosePreview
						</button>
						<br />
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
