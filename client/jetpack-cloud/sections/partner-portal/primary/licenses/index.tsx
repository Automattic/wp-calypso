/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';

interface Props {
	filter: LicenseFilter;
	search: string;
	sortDirection?: string;
	sortField?: string;
}

export default function Licenses( {
	filter,
	search,
	sortDirection = 'asc',
	sortField = 'issued_at',
}: Props ): ReactElement {
	const translate = useTranslate();

	return (
		<Main wideLayout={ true } className="licenses">
			<DocumentHead title={ translate( 'Licenses' ) } />

			<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

			<LicenseStateFilter filter={ filter } search={ search } />

			<LicenseList
				filter={ filter }
				search={ search }
				sortDirection={ sortDirection }
				sortField={ sortField }
			/>
		</Main>
	);
}
