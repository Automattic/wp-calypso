/**
 * External dependencies
 */
import React, { ReactElement, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';
import SelectDropdown from 'calypso/components/select-dropdown';
import {
	getActivePartnerKeyId,
	getCurrentPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	filter: LicenseFilter;
	search: string;
	currentPage: number;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
}

export default function Licenses( {
	filter,
	search,
	currentPage,
	sortDirection,
	sortField,
}: Props ): ReactElement {
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

	const context = {
		filter,
		search,
		currentPage,
		sortDirection,
		sortField,
	};

	return (
		<Main wideLayout={ true } className="licenses">
			<DocumentHead title={ translate( 'Licenses' ) } />

			<div className="licenses__header">
				<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>
				{ options && options.length > 2 && (
					<SelectDropdown
						initialSelected={ activeKeyId.toString() }
						options={ options }
						onSelect={ onKeySelect }
						compact
					/>
				) }
				<Button href="/partner-portal/issue-license" primary style={ { marginLeft: 'auto' } }>
					{ translate( 'Issue New License' ) }
				</Button>
			</div>

			<LicenseListContext.Provider value={ context }>
				<LicenseStateFilter />

				<LicenseList />
			</LicenseListContext.Provider>
		</Main>
	);
}
