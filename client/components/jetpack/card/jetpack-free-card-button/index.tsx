/**
 * External dependencies
 */
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { JPC_PATH_BASE } from 'calypso/jetpack-connect/constants';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { addQueryArgs } from 'calypso/lib/route';
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url';
import getJetpackWpAdminUrl from 'calypso/state/selectors/get-jetpack-wp-admin-url';

/**
 * Type dependencies
 */
import type { QueryArgs } from 'calypso/my-sites/plans/jetpack-plans/types';

interface JetpackFreeCardButtonProps {
	className?: string;
	label?: TranslateResult;
	primary?: boolean;
	siteId: number | null;
	urlQueryArgs: QueryArgs;
}

const JetpackFreeCardButton: FC< JetpackFreeCardButtonProps > = ( {
	className,
	label,
	primary = false,
	siteId,
	urlQueryArgs,
} ) => {
	const translate = useTranslate();
	const wpAdminUrl = useSelector( getJetpackWpAdminUrl );
	const { site } = urlQueryArgs;

	// If the user is not logged in and there is a site in the URL, we need to construct
	// the URL to wp-admin from the `site` query parameter
	let jetpackAdminUrlFromQuery;

	if ( site ) {
		let wpAdminUrlFromQuery;

		// Ensure that URL is valid
		try {
			// Slugs of secondary sites of a multisites network follow this syntax: example.net::second-site
			wpAdminUrlFromQuery = new URL( `https://${ site.replace( '::', '/' ) }/wp-admin/admin.php` );
		} catch ( e ) {}

		if ( wpAdminUrlFromQuery ) {
			jetpackAdminUrlFromQuery = getUrlFromParts( {
				...getUrlParts( wpAdminUrlFromQuery.href ),
				search: '?page=jetpack',
				hash: '/my-plan',
			} ).href;
		}
	}

	const onClickTrack = useTrackCallback( undefined, 'calypso_product_jpfree_click', {
		site_id: siteId || undefined,
	} );

	// `siteId` is going to be null if the user is not logged in, so we need to check
	// if there is a site in the URL also
	const isSiteinContext = siteId || site;

	// Jetpack Connect flow uses `url` instead of `site` as the query parameter for a site URL
	const { site: url, ...restQueryArgs } = urlQueryArgs;
	const startHref =
		isJetpackCloud() && ! isSiteinContext
			? addQueryArgs( { url, ...restQueryArgs }, `https://wordpress.com${ JPC_PATH_BASE }` )
			: wpAdminUrl || jetpackAdminUrlFromQuery || JPC_PATH_BASE;
	return (
		<Button primary={ primary } className={ className } href={ startHref } onClick={ onClickTrack }>
			{ label || translate( 'Start for free' ) }
		</Button>
	);
};

export default JetpackFreeCardButton;
