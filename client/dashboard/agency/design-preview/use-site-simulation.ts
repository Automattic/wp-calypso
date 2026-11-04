import { useState } from 'react';
import { getFormatError } from '../marketplace/purchases/use-site-address';
import { parseSiteUrl } from '../sites/add-new-site/lib';
import { addPreviewSites, sampleSites, useDesignPreview } from './index';
import type { SiteAddress } from '../marketplace/purchases/use-site-address';
import type { AgencySite, Site } from '@automattic/api-core';

let nextId = -10000;

// Kept separate from the real queries and mutations: sample interactions never
// populate the account cache or submit a connection/provisioning request.
export default function useSiteSimulation() {
	const preview = useDesignPreview();
	const [ address, setAddress ] = useState( 'clientdemo' );
	const formatError = getFormatError( address );
	const isTaken = preview.siteRows.some( ( site ) => site.url === `${ address }.wpcomstaging.com` );
	const suggestAddress = () => setAddress( `clientdemo${ preview.siteRows.length + 1 }` );
	const siteAddress: SiteAddress = {
		address,
		setAddress,
		formatError,
		isSuggesting: false,
		isChecking: false,
		isTaken,
		alternative: isTaken ? `clientdemo${ preview.siteRows.length + 1 }` : undefined,
		isReady: ! formatError && ! isTaken,
		refreshSuggestion: suggestAddress,
		revalidate: () => {},
	};
	const addSite = ( input: string, isDevSite = false, name = '' ) => {
		const url = parseSiteUrl( input );
		if ( ! url ) {
			return;
		}
		const id = nextId--;
		const siteUrl = `${ url.host }${ url.pathname.replace( /\/$/, '' ) }`;
		const site: AgencySite = {
			blog_id: id,
			a4a_site_id: id,
			url: siteUrl,
			url_with_scheme: `${ url.protocol }//${ siteUrl }`,
			blogname: name || ( isDevSite ? address : siteUrl ),
			a4a_is_dev_site: isDevSite,
			is_atomic: isDevSite,
			hosting_provider_guess: isDevSite ? 'WordPress.com' : undefined,
		};
		addPreviewSites( [ site ] );
	};
	const importable = sampleSites
		.slice( 0, 4 )
		.filter( ( site ) => ! preview.siteRows.some( ( managed ) => managed.url === site.url ) );

	if ( ! preview.sitesActive ) {
		return undefined;
	}
	return {
		managedSites: preview.siteRows,
		availableDevSites: Math.max(
			0,
			5 - preview.siteRows.filter( ( site ) => site.a4a_is_dev_site ).length
		),
		onConnect: ( site: string, name = '' ) => addSite( site, false, name ),
		onCreateHosted: (
			input: string,
			name: string,
			host: 'wpcom' | 'pressable',
			development = false
		) => {
			const url = parseSiteUrl( input );
			if ( ! url ) {
				return;
			}
			const siteUrl = `${ url.host }${ url.pathname.replace( /\/$/, '' ) }`;
			const existing = preview.siteRows.find( ( site ) => site.url === siteUrl );
			const id = existing?.blog_id ?? nextId--;
			addPreviewSites(
				[
					{
						blog_id: id,
						a4a_site_id: existing?.a4a_site_id ?? id,
						url: siteUrl,
						url_with_scheme: `${ url.protocol }//${ siteUrl }`,
						blogname: name || existing?.blogname || siteUrl,
						is_atomic: host === 'wpcom',
						a4a_is_dev_site: development,
						hosting_provider_guess: host === 'wpcom' ? 'WordPress.com' : 'Pressable',
					},
				],
				true
			);
		},
		import: {
			sites: importable.map(
				( site ) =>
					( {
						ID: site.blog_id,
						name: site.blogname,
						URL: site.url_with_scheme,
						slug: site.url,
						is_wpcom_atomic: site.is_atomic,
						jetpack: ! site.is_atomic,
						is_wpcom_staging_site: false,
						site_migration: { in_progress: false, is_complete: false },
						options: { created_at: '2026-01-15T00:00:00+00:00' },
					} ) as Site
			),
			onImport: ( ids: number[] ) =>
				addPreviewSites( importable.filter( ( site ) => ids.includes( site.blog_id ) ) ),
		},
		development: {
			siteAddress,
			onCreate: ( name: string ) => {
				addSite( `${ name }.wpcomstaging.com`, true );
				suggestAddress();
			},
		},
	};
}
