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
import { setActivePartnerKey } from 'calypso/state/licensing-portal/actions';
import {
	isFetchingPartners,
	getAllPartners,
	hasActivePartnerKey,
} from 'calypso/state/licensing-portal/selectors';
import QueryJetpackLicensingPartners from 'calypso/components/data/query-jetpack-licensing-partners';
import Main from 'calypso/components/main';
import Spinner from 'calypso/components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

const SelectPartnerKey: React.FC = () => {
	const translate = useTranslate();
	const hasKey = useSelector( hasActivePartnerKey );
	const isFetching = useSelector( isFetchingPartners );
	const partners = useSelector( getAllPartners );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( hasKey ) {
			const returnUrl = getQueryArg( window.location.href, 'return' ) as string;
			page.redirect( returnUrl || '/licensing-portal' );
		}
	}, [ hasKey ] );

	return (
		<>
			<QueryJetpackLicensingPartners />
			<Main className="select-partner-key">
				{ isFetching && (
					<Card>
						<Spinner />
					</Card>
				) }

				{ map( partners, ( partner ) =>
					map( partner.keys, ( key ) => (
						<Card key={ key.id } className="select-partner-key__card">
							<div className="select-partner-key__key-name">{ key.name }</div>
							<Button primary onClick={ () => dispatch( setActivePartnerKey( key.id ) ) }>
								{ translate( 'Use' ) }
							</Button>
						</Card>
					) )
				) }
			</Main>
		</>
	);
};

export default SelectPartnerKey;
