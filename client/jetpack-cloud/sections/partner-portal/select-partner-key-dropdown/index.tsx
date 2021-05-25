/**
 * External dependencies
 */
import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	getActivePartnerKeyId,
	getCurrentPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import SelectDropdown from 'calypso/components/select-dropdown';

/**
 * Style dependencies
 */
import './style.scss';

export default function SelectPartnerKeyDropdown(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const activeKeyId = useSelector( getActivePartnerKeyId );
	const onKeySelect = useCallback(
		( option ) => {
			dispatch( setActivePartnerKey( parseInt( option.value ) ) );
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_select_partner_key_dropdown_option_select' )
			);
		},
		[ dispatch ]
	);

	const options =
		partner &&
		partner.keys.map( ( key ) => ( {
			value: key.id.toString(),
			label: key.name,
		} ) );

	if ( ! options || options.length <= 1 ) {
		return null;
	}

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
