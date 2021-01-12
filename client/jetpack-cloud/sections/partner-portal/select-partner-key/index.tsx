/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getQueryArg } from '@wordpress/url';
import page from 'page';
import map from 'lodash/map';

/**
 * Internal dependencies
 */
import { setActivePartnerKey } from 'calypso/state/partner-portal/actions';
import {
	isFetchingPartners,
	getAllPartners,
	hasActivePartnerKey,
} from 'calypso/state/partner-portal/selectors';
import QueryJetpackPartnerPortalPartners from 'calypso/components/data/query-jetpack-partner-portal-partners';
import Main from 'calypso/components/main';
import Spinner from 'calypso/components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

export default function SelectPartnerKey() {
	const translate = useTranslate();
	const hasKey = useSelector( hasActivePartnerKey );
	const isFetching = useSelector( isFetchingPartners );
	const partners = useSelector( getAllPartners );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( hasKey ) {
			const returnUrl = getQueryArg( window.location.href, 'return' ) as string;
			page.redirect( returnUrl || '/partner-portal' );
		}
	}, [ hasKey ] );

	const keys = map( partners, ( partner ) =>
		map( partner.keys, ( key ) => (
			<Card key={ key.id } className="select-partner-key__card">
				<div className="select-partner-key__key-name">{ key.name }</div>
				<Button primary onClick={ () => dispatch( setActivePartnerKey( key.id ) ) }>
					{ translate( 'Use' ) }
				</Button>
			</Card>
		) )
	);

	return (
		<>
			<QueryJetpackPartnerPortalPartners />
			<Main className="select-partner-key">
				{ isFetching && (
					<Card>
						<Spinner />
					</Card>
				) }

				{ ! isFetching && keys.length === 0 && (
					<Card>{ translate( 'You are not registered as a partner.' ) }</Card>
				) }

				{ keys }
			</Main>
		</>
	);
}
