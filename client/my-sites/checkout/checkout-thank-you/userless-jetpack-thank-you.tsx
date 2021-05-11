/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getHttpData, DataState } from 'calypso/state/data-layer/http-data';
import { getRequestUnauthorizedSiteId, requestUnauthorizedSite } from 'calypso/state/data-getters';

interface Props {
	site: number | string;
}

const UserlessJetpackThankYou: FunctionComponent< Props > = ( { site: siteFragment } ) => {
	const translate = useTranslate();

	const { state: requestState, data: site, error: requestError } = useSelector( () =>
		getHttpData( getRequestUnauthorizedSiteId( siteFragment ) )
	);

	// const loadingActivity = ! [ DataState.Success, DataState.Failure ].includes( requestState );

	useEffect( () => {
		requestUnauthorizedSite( siteFragment );
	}, [ siteFragment ] );

	console.log( 'siteInfo' );
	console.log( site );

	return (
		<Card>
			<JetpackLogo full={ true } />
			<h2>
				{ translate( 'Thank you for your purchase!' ) }
				{ String.fromCodePoint( 0x1f389 ) }
				{ /* Celebration emoji 🎉 */ }
			</h2>
		</Card>
	);
};

export default UserlessJetpackThankYou;
