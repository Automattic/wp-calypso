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
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { addQueryArgs } from 'calypso/lib/route';
import getJetpackWpAdminUrl from 'calypso/state/selectors/get-jetpack-wp-admin-url';
import { JPC_PATH_BASE } from 'calypso/jetpack-connect/constants';

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
	const onClickTrack = useTrackCallback( undefined, 'calypso_product_jpfree_click', {
		site_id: siteId || undefined,
	} );

	// Jetpack Connect flow uses `url` instead of `site` as the query parameter for a site URL
	const { site: url, ...restQueryArgs } = urlQueryArgs;
	const startHref = isJetpackCloud()
		? addQueryArgs( { url, ...restQueryArgs }, `https://wordpress.com${ JPC_PATH_BASE }` )
		: wpAdminUrl || JPC_PATH_BASE;
	return (
		<Button primary={ primary } className={ className } href={ startHref } onClick={ onClickTrack }>
			{ label || translate( 'Start for free' ) }
		</Button>
	);
};

export default JetpackFreeCardButton;
