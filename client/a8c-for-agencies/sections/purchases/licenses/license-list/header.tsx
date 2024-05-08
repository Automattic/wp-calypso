import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { PropsWithChildren, useCallback, useContext } from 'react';
import { internalToPublicLicenseSortField } from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicensesOverviewContext from '../licenses-overview/context';

import './style.scss';

function setSortingConfig(
	newSortField: LicenseSortField,
	sortField: LicenseSortField,
	sortDirection: LicenseSortDirection
): void {
	let direction = LicenseSortDirection.Descending;

	if ( newSortField === sortField && sortDirection === direction ) {
		direction = LicenseSortDirection.Ascending;
	}

	const queryParams = {
		sort_field: internalToPublicLicenseSortField( newSortField ),
		sort_direction: direction,
		page: 1,
	};
	const currentPath = window.location.pathname + window.location.search;

	page( addQueryArgs( queryParams, currentPath ) );
}

interface SortButtonProps {
	sortField: LicenseSortField;
	currentSortField: LicenseSortField;
	currentSortDirection: LicenseSortDirection;
}

function SortButton( {
	sortField,
	currentSortField,
	currentSortDirection,
	children,
}: PropsWithChildren< SortButtonProps > ) {
	const dispatch = useDispatch();
	const sort = useCallback( () => {
		setSortingConfig( sortField, currentSortField, currentSortDirection );
		dispatch(
			recordTracksEvent( 'calypso_a4a_license_list_sort_button_click', {
				sort_field: sortField,
				current_sort_field: currentSortField,
				current_sort_direction: currentSortDirection,
			} )
		);
	}, [ dispatch, sortField, currentSortField, currentSortDirection ] );

	return (
		<h2 className={ clsx( { 'is-selected': sortField === currentSortField } ) }>
			<button onClick={ sort }>
				{ children }
				<Gridicon
					icon="dropdown"
					className={ clsx( 'license-list-item__sort-indicator', {
						[ `is-sort-${ currentSortDirection }` ]: true,
					} ) }
				/>
			</button>
		</h2>
	);
}

export default function LicenseListHeader() {
	const translate = useTranslate();
	const { filter, sortField, sortDirection } = useContext( LicensesOverviewContext );

	return (
		<LicenseListItem header className="license-list__header">
			<h2>{ translate( 'Product' ) }</h2>

			<h2>{ translate( 'Site' ) }</h2>

			<SortButton
				sortField={ LicenseSortField.IssuedAt }
				currentSortField={ sortField }
				currentSortDirection={ sortDirection }
			>
				{ translate( 'Issued on' ) }
			</SortButton>

			{ filter !== LicenseFilter.Revoked && (
				<SortButton
					sortField={ LicenseSortField.AttachedAt }
					currentSortField={ sortField }
					currentSortDirection={ sortDirection }
				>
					{ translate( 'Assigned on' ) }
				</SortButton>
			) }

			{ filter === LicenseFilter.Revoked && (
				<SortButton
					sortField={ LicenseSortField.RevokedAt }
					currentSortField={ sortField }
					currentSortDirection={ sortDirection }
				>
					{ translate( 'Revoked on' ) }
				</SortButton>
			) }

			<div>{ /* Intentionally empty header. */ }</div>

			<div>{ /* Intentionally empty header. */ }</div>
		</LicenseListItem>
	);
}
