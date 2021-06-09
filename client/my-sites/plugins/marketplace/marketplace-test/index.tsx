/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import { Button, Card } from '@automattic/components';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
// import { getPlugins, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';

export const Container = styled.div`
	margin: 0 25px;
	padding: 25px;
`;

export default function MarketplaceTest() {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = useSelector( getSelectedSiteId );
	// This selector is not working
	// const pluginDetails = useSelector( ( state ) => getPlugins( state, selectedSiteId ) );
	const pluginDetails = useSelector(
		( state ) => state.plugins.installed.plugins[ selectedSiteId ]
	);
	const [ infiniteLoopCount, setInfiniteLoopCount ] = useState( 0 );
	const marketplacePages = [
		{ name: 'Plugin Details Page', path: '/marketplace/product/details/wordpress-seo' },
		{ name: 'Loading Page', path: '/marketplace/product/setup' },
		{ name: 'Domains Page', path: '/marketplace/domain' },
		{ name: 'Thank You Page', path: '/marketplace/thank-you' },
	];
	const dispatch = useDispatch();
	const transferDetails = useSelector( ( state ) =>
		getAutomatedTransfer( state, selectedSite?.ID ?? 0 )
	);

	//Infinite Loop
	useEffect( () => {
		setTimeout( () => {
			dispatch( fetchAutomatedTransferStatus( selectedSite?.ID ?? 0 ) );

			setInfiniteLoopCount( ( l ) => l + 1 );
		}, 4000 );
	}, [ infiniteLoopCount, fetchAutomatedTransferStatus, selectedSite ] );

	const { ID, URL, domain, options } = selectedSite;
	const { is_wpcom_atomic, is_automated_transfer } = options;
	return (
		<Container>
			{ selectedSiteId && <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> }
			<SidebarNavigation />
			<Card key="heading">
				<CardHeading tagName="h1" size={ 24 }>
					Marketplace Test Page
				</CardHeading>
				<CardHeading tagName="h1" size={ 24 }>
					<div>Currrent Site : { selectedSite?.domain }</div>
				</CardHeading>
			</Card>
			<Card key="navigation-links">
				{ marketplacePages.map( ( p ) => {
					const path = `${ p.path }${ selectedSite?.domain ? `/${ selectedSite.domain }` : '' }`;
					return (
						<Button key={ p.path } onClick={ () => page( path ) }>
							{ p.name }
						</Button>
					);
				} ) }
			</Card>
			<Card key="important-state">
				<Card key="site-information">
					<CardHeading tagName="h1" size={ 21 }>
						Selected Site details selector <strong>getSelectedSite</strong>
					</CardHeading>
					<div>ID : { ID }</div>
					<div>URL : { URL }</div>
					<div>domain : { domain }</div>
					<div>options.is_wpcom_atomic : { is_wpcom_atomic?.toString() }</div>
					<div>options.is_automated_transfer : { is_automated_transfer?.toString() }</div>
				</Card>
				<Card key="transfer-information">
					<CardHeading tagName="h1" size={ 21 }>
						Transfer Details
						<div>
							selector:<strong>transferDetails</strong>
						</div>
						<div>
							dispatch:<strong>fetchAutomatedTransferStatus</strong>
						</div>
					</CardHeading>
					{ Object.entries( transferDetails ).map( ( entry, i ) => (
						<div key={ i }>
							{ JSON.stringify( entry[ 0 ] ) } : { JSON.stringify( entry[ 1 ] ) }
						</div>
					) ) }
				</Card>
			</Card>
			<Card key="installed-plugins">
				<CardHeading tagName="h1" size={ 21 }>
					3rd Party Plugins Installed
				</CardHeading>
				{ pluginDetails &&
					pluginDetails
						.filter( ( plugin ) => plugin.author !== 'Automattic' )
						.map( ( details ) => (
							<Card key={ details.id }>
								{ Object.entries( details )
									.filter(
										( [ key ] ) =>
											! [ 'description', 'network', 'autoupdate', 'version', 'id' ].includes( key )
									)
									.map( ( [ key, value ] ) => (
										<div key={ key }>
											{ key } : { JSON.stringify( value ) }
										</div>
									) ) }
							</Card>
						) ) }
			</Card>
		</Container>
	);
}

//////SelectedSite Details Sample
// eslint-disable-next-line
const selectedSiteBusinessPlanNotTransferredSample = {
	selectedSite: {
		ID: 194170136,
		name: 'yoasttesting',
		description: '',
		URL: 'http://yoasttesting1623216043388.blog',
		capabilities: {
			edit_pages: true,
			edit_posts: true,
			edit_others_posts: true,
			edit_others_pages: true,
			delete_posts: true,
			delete_others_posts: true,
			edit_theme_options: true,
			edit_users: true,
			list_users: true,
			manage_categories: true,
			manage_options: true,
			moderate_comments: true,
			activate_wordads: true,
			promote_users: true,
			publish_posts: true,
			upload_files: true,
			delete_users: false,
			remove_users: true,
			own_site: true,
			view_hosting: true,
			view_stats: true,
			activate_plugins: true,
		},
		jetpack: false,
		is_multisite: true,
		lang: 'en',
		visible: true,
		is_private: false,
		is_coming_soon: true,
		single_user_site: true,
		is_vip: false,
		options: {
			timezone: 'Asia/Colombo',
			gmt_offset: 5.5,
			videopress_enabled: true,
			upgraded_filetypes_enabled: true,
			admin_url: 'https://yoasttesting1623216043388.wordpress.com/wp-admin/',
			is_mapped_domain: true,
			is_redirect: false,
			unmapped_url: 'https://yoasttesting1623216043388.wordpress.com',
			default_post_format: '0',
			allowed_file_types: [],
			show_on_front: 'page',
			default_comment_status: true,
			default_ping_status: true,
			software_version: '5.7.2',
			created_at: '2021-06-09T05:22:03+00:00',
			wordads: false,
			publicize_permanently_disabled: false,
			frame_nonce: '879790f6cd',
			jetpack_frame_nonce: '879790f6cd',
			page_on_front: 2,
			page_for_posts: 0,
			advanced_seo_front_page_description: '',
			advanced_seo_title_formats: [],
			verification_services_codes: null,
			podcasting_archive: null,
			is_domain_only: false,
			is_automated_transfer: false,
			is_wpcom_atomic: false,
			is_wpcom_store: false,
			woocommerce_is_active: false,
			design_type: null,
			site_segment: null,
			is_wpforteams_site: false,
			p2_hub_blog_id: null,
			site_creation_flow: 'gutenboarding',
			is_cloud_eligible: false,
			anchor_podcast: false,
		},
		plan: {
			product_id: 1008,
			product_slug: 'business-bundle',
			product_name_short: 'Business',
			expired: false,
			user_is_owner: true,
			is_free: false,
		},
		products: [],
		jetpack_modules: null,
		launch_status: 'unlaunched',
		site_migration: null,
		is_fse_active: false,
		is_fse_eligible: false,
		is_core_site_editor_enabled: false,
		domain: 'yoasttesting1623216043388.blog',
		hasConflict: false,
		is_customizable: true,
		is_previewable: true,
		slug: 'yoasttesting1623216043388.blog',
		title: 'yoasttesting',
		wpcom_url: 'yoasttesting1623216043388.wordpress.com',
	},
};
