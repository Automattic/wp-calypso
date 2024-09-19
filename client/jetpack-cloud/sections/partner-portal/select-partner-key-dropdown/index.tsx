import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import {
	getActivePartnerKeyId,
	getCurrentPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import './style.scss';

export default function SelectPartnerKeyDropdown() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const activeKeyId = useSelector( getActivePartnerKeyId );
	const onKeySelect = useCallback(
		( option: ( typeof options )[ number ] ) => {
			dispatch( setActivePartnerKey( parseInt( option.value ) ) );
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_select_partner_key_dropdown_option_select' )
			);
		},
		[ dispatch ]
	);

	if ( ! partner?.keys?.length ) {
		return null;
	}

	const options = partner.keys.map( ( key ) => ( {
		value: key.id.toString(),
		label: key.name,
		isLabel: false,
	} ) );

	options?.unshift( { label: translate( 'Partner Key' ) as string, value: '', isLabel: true } );

	return (
		<SelectDropdown
			className="select-partner-key-dropdown"
			initialSelected={ activeKeyId.toString() }
			options={ options }
			onSelect={ onKeySelect }
			compact
		/>
	);
}
