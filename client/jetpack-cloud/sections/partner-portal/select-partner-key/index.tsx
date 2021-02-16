/**
 * External dependencies
 */
import React, { ReactElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getQueryArg } from '@wordpress/url';
import page from 'page';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { PartnerKey } from 'calypso/state/partner-portal';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasActivePartnerKey,
} from 'calypso/state/partner-portal/partner/selectors';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import Spinner from 'calypso/components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

export default function SelectPartnerKey(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hasKey = useSelector( hasActivePartnerKey );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = get( partner, 'keys', [] ) as PartnerKey[];

	useEffect( () => {
		if ( hasKey ) {
			const returnUrl = getQueryArg( window.location.href, 'return' ) as string;
			page.redirect( returnUrl || '/partner-portal' );
		}
	}, [ hasKey ] );

	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<Main className="select-partner-key">
				{ isFetching && (
					<Card>
						<Spinner />
					</Card>
				) }

				{ ! isFetching && keys.length === 0 && (
					<Card>{ translate( 'You are not registered as a partner.' ) }</Card>
				) }

				{ ! isFetching &&
					keys.map( ( key ) => (
						<Card key={ key.id } className="select-partner-key__card">
							<div className="select-partner-key__key-name">{ key.name }</div>
							<Button primary onClick={ () => dispatch( setActivePartnerKey( key.id ) ) }>
								{ translate( 'Use' ) }
							</Button>
						</Card>
					) ) }
			</Main>
		</>
	);
}
