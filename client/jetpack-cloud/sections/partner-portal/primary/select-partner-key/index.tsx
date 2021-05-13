/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PartnerKey } from 'calypso/state/partner-portal/types';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import {
	isFetchingPartner,
	getCurrentPartner,
	hasActivePartnerKey,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import { useReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';

/**
 * Style dependencies
 */
import './style.scss';

export default function SelectPartnerKey(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const hasKey = useSelector( hasActivePartnerKey );
	const hasFetched = useSelector( hasFetchedPartner );
	const isFetching = useSelector( isFetchingPartner );
	const partner = useSelector( getCurrentPartner );
	const keys = ( partner?.keys || [] ) as PartnerKey[];
	const showKeys = hasFetched && ! isFetching && keys.length > 0;

	useReturnUrl( hasKey );

	return (
		<Main className="select-partner-key">
			<QueryJetpackPartnerPortalPartner />

			<CardHeading size={ 36 }>{ translate( 'Partner Portal' ) }</CardHeading>

			{ isFetching && <Spinner /> }

			{ showKeys && (
				<div>
					<p>{ translate( 'Please select your partner key:' ) }</p>

					{ keys.map( ( key ) => (
						<Card key={ key.id } className="select-partner-key__card" compact>
							<div className="select-partner-key__key-name">{ key.name }</div>
							<Button primary onClick={ () => dispatch( setActivePartnerKey( key.id ) ) }>
								{ translate( 'Select' ) }
							</Button>
						</Card>
					) ) }
				</div>
			) }
		</Main>
	);
}
