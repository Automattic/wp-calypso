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
import SelectDropdown from 'calypso/components/select-dropdown';

export default function SelectPartnerKeyDropdown(): ReactElement | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const partner = useSelector( getCurrentPartner );
	const activeKeyId = useSelector( getActivePartnerKeyId );
	const onKeySelect = useCallback(
		( option ) => {
			dispatch( setActivePartnerKey( parseInt( option.value ) ) );
		},
		[ dispatch ]
	);

	const options =
		partner &&
		partner.keys.map( ( key ) => ( {
			value: key.id.toString(),
			label: key.name,
		} ) );

	options?.unshift( { label: translate( 'Partner Key' ) as string, value: '', isLabel: true } );

	if ( ! options || options.length < 2 ) {
		return null;
	}

	return (
		<SelectDropdown
			initialSelected={ activeKeyId.toString() }
			options={ options }
			onSelect={ onKeySelect }
			compact
		/>
	);
}
