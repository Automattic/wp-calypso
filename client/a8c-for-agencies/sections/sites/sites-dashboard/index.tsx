import page from '@automattic/calypso-router';
import React, { useEffect, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';

type Props = {
	currentPage: number;
	category: string;
	hideSiteList: boolean;
	isFavorites: boolean;
	siteUrl: string;
	siteFeature: string;
};

export default function SitesDashboard( {
	currentPage,
	category,
	hideSiteList,
	isFavorites,
	siteUrl,
	siteFeature,
}: Props ) {
	const title = isFavorites ? 'Sites Favorites' : 'Sites';
	const [ currentSitePreview, setCurrentSitePreview ] = useState( siteUrl );
	const [ currentSiteFeature, setCurrentSiteFeature ] = useState( siteFeature );

	const changeCurrentSitePreview = () => {
		const randomSite = `example-${ Math.floor( Math.random() * 1000 ) }.com`;

		setCurrentSitePreview( randomSite );
	};

	const changeCurrentSiteFeature = () => {
		const randomNumber = Math.floor( Math.random() * 1000 );

		setCurrentSiteFeature( 'Feature ' + randomNumber );
	};

	const closePreview = () => {
		setCurrentSitePreview( '' );
		window.hideSiteList = false;
	};

	window.hideSiteList =
		typeof window.hideSiteList === 'undefined' ? hideSiteList : window.hideSiteList;

	useEffect( () => {
		if ( category && currentSitePreview && currentSiteFeature ) {
			page.replace(
				'/sites/' +
					category +
					'/' +
					encodeURIComponent( currentSitePreview ) +
					'/' +
					encodeURIComponent( currentSiteFeature )
			);
		} else if ( category && currentSitePreview ) {
			page.replace( '/sites/' + category + '/' + encodeURIComponent( currentSitePreview ) );
		} else if ( category ) {
			page.replace( '/sites/' + category );
		} else {
			page.replace( '/sites' );
		}
	}, [ currentSitePreview, currentSiteFeature, category ] );

	return (
		<Layout title="Sites" wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<div style={ { display: 'flex' } }>
					<div style={ { border: '1px solid black', flex: 1 } }>{ currentPage }</div>
					<div
						style={ {
							border: '1px solid red',
							flex: 1,
							display: window.hideSiteList ? 'none' : 'block',
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
							display: currentSitePreview ? 'block' : 'none',
						} }
					>
						Selected Site: { currentSitePreview }
						<br />
						Selected Feature: { currentSiteFeature }
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
