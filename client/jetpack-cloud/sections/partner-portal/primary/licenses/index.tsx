/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Main from 'calypso/components/main';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import SidebarNavigation from 'calypso/jetpack-cloud/sections/partner-portal/sidebar-navigation';
import LicenseList from 'calypso/jetpack-cloud/sections/partner-portal/license-list';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import LicenseStateFilter from 'calypso/jetpack-cloud/sections/partner-portal/license-state-filter';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import SelectPartnerKeyDropdown from 'calypso/jetpack-cloud/sections/partner-portal/select-partner-key-dropdown';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

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
	const dispatch = useDispatch();
	const translate = useTranslate();

	const context = {
		filter,
		search,
		currentPage,
		sortDirection,
		sortField,
	};

	const onIssueNewLicenseClick = () => {
		dispatch( recordTracksEvent( 'calypso_partner_portal_license_list_issue_license_click' ) );
	};

	return (
		<Main wideLayout className="licenses">
			<DocumentHead title={ translate( 'Licenses' ) } />
			<SidebarNavigation />

			<div className="licenses__header">
				<CardHeading size={ 36 }>{ translate( 'Licenses' ) }</CardHeading>

				<SelectPartnerKeyDropdown />

				<Button
					href="/partner-portal/issue-license"
					onClick={ onIssueNewLicenseClick }
					primary
					style={ { marginLeft: 'auto' } }
				>
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
