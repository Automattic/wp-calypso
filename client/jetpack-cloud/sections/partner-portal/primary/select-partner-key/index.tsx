import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { PartnerKey } from 'calypso/state/partner-portal/types';
import './style.scss';

export default function SelectPartnerKey() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const keys = ( partner?.keys || [] ) as PartnerKey[];

	const onSelectPartnerKey = ( keyId: number ) => {
		dispatch( setActivePartnerKey( keyId ) );
		dispatch( recordTracksEvent( 'calypso_partner_portal_select_partner_key_click' ) );
	};

	return (
		<div className="select-partner-key">
			<p>{ translate( 'Please select your partner key:' ) }</p>

			{ keys.map( ( key ) => (
				<Card key={ key.id } className="select-partner-key__card" compact>
					<div className="select-partner-key__key-name">{ key.name }</div>
					<Button primary onClick={ () => onSelectPartnerKey( key.id ) }>
						{ translate( 'Select' ) }
					</Button>
				</Card>
			) ) }
		</div>
	);
}
