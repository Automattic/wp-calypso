/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getQueryArg } from '@wordpress/url';
import page from 'page';
// import get from 'lodash/get';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Partner, PartnerKey } from 'calypso/state/partner-portal';
import { setActivePartnerKey } from 'calypso/state/partner-portal/actions';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasActivePartnerKey,
} from 'calypso/state/partner-portal/selectors';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import Spinner from 'calypso/components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

export default function SelectPartnerKey() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hasKey = useSelector( hasActivePartnerKey ) as boolean;
	const isFetching = useSelector( isFetchingPartner ) as boolean;
	const partner = useSelector( getCurrentPartner ) as Partner | null;
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

				{ keys.map( ( key ) => (
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
