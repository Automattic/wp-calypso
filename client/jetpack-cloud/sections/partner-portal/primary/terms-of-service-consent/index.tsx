/**
 * External dependencies
 */
import React, { ReactElement, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getQueryArg } from '@wordpress/url';
import page from 'page';

/**
 * Internal dependencies
 */
import { APIPartner } from 'calypso/state/partner-portal/types';
import wpcom from 'calypso/lib/wp';
import {
	getCurrentPartner,
	hasFetchedPartner,
	isFetchingPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { receivePartner } from 'calypso/state/partner-portal/partner/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	ensurePartnerPortalReturnUrl,
	formatApiPartner,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';

function mutationConsent( consent: boolean ): Promise< APIPartner > {
	return wpcom.req.post( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/partner',
		body: { tos: consent },
	} );
}

export default function TermsOfServiceConsent(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const consent = useMutation( mutationConsent, {
		onSuccess: ( partner ) => {
			dispatch( receivePartner( formatApiPartner( partner ) ) );
		},
		onError: () => {
			dispatch(
				errorNotice( translate( 'We were unable to update your partner account details.' ) )
			);
		},
	} );
	const partner = useSelector( getCurrentPartner );
	const hasConsented = partner?.tos || false;
	const fetchedPartner = useSelector( hasFetchedPartner );
	const fetchingPartner = useSelector( isFetchingPartner );

	const acceptTOS = useCallback( () => {
		consent.mutate( true );
	}, [] );

	useEffect( () => {
		if ( hasConsented ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			page.redirect( returnUrl );
		}
	}, [ hasConsented ] );

	return (
		<Main className="terms-of-service-consent">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

			{ ! fetchedPartner && <Spinner /> }

			{ ! hasConsented && (
				<Card>
					<CardHeading>{ translate( 'Terms of Service' ) }</CardHeading>
					<div className="terms-of-service-consent__content">
						{ /*TODO add ToS*/ }
						<p>Terms of service go here.</p>
					</div>

					<div style={ { textAlign: 'right' } }>
						<Button onClick={ acceptTOS } busy={ consent.isLoading || fetchingPartner } primary>
							{ translate( 'Accept' ) }
						</Button>
					</div>
				</Card>
			) }
		</Main>
	);
}
