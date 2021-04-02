/**
 * External dependencies
 */
import React, { PropsWithChildren, ReactElement, useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import classnames from 'classnames';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { License, PaginatedItems } from 'calypso/state/partner-portal/types';
import QueryJetpackPartnerPortalLicenses from 'calypso/components/data/query-jetpack-partner-portal-licenses';
import {
	getPaginatedLicenses,
	hasFetchedLicenses,
	isFetchingLicenses,
} from 'calypso/state/partner-portal/licenses/selectors';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import LicensePreview, {
	LicensePreviewPlaceholder,
} from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import { LICENSES_PER_PAGE } from 'calypso/state/partner-portal/licenses/constants';
import Gridicon from 'calypso/components/gridicon';
import Pagination from 'calypso/components/pagination';
import { addQueryArgs } from 'calypso/lib/route';
import { internalToPublicLicenseSortField } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';

/**
 * Style dependencies
 */
import './style.scss';

function setPage( pageNumber: number ): void {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;

	page( addQueryArgs( queryParams, currentPath ) );
}

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

interface LicenseTransitionProps {
	key?: string;
}

const LicenseTransition = ( props: React.PropsWithChildren< LicenseTransitionProps > ) => (
	<CSSTransition { ...props } classNames="license-list__license-transition" timeout={ 150 } />
);

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
	const sort = useCallback( () => {
		setSortingConfig( sortField, currentSortField, currentSortDirection );
	}, [ sortField, currentSortField, currentSortDirection ] );

	return (
		<h2 className={ classnames( { 'is-selected': sortField === currentSortField } ) }>
			<button onClick={ sort }>
				{ children }
				<Gridicon
					icon="dropdown"
					className={ classnames( 'license-list-item__sort-indicator', {
						[ `is-sort-${ currentSortDirection }` ]: true,
					} ) }
				/>
			</button>
		</h2>
	);
}

export default function LicenseList(): ReactElement {
	const translate = useTranslate();
	const { filter, search, sortField, sortDirection, currentPage } = useContext(
		LicenseListContext
	);
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;
	const showLicenses = hasFetched && ! isFetching && !! licenses;
	const showPagination = showLicenses && licenses.totalPages > 1;
	const showNoResults = hasFetched && ! isFetching && licenses && licenses.items.length === 0;

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses
				filter={ filter }
				search={ search }
				sortField={ sortField }
				sortDirection={ sortDirection }
				page={ currentPage }
			/>

			<LicenseListItem header className="license-list__header">
				<h2>{ translate( 'License state' ) }</h2>

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

			<TransitionGroup className="license-list__transition-group">
				{ showLicenses &&
					licenses.items.map( ( license ) => (
						<LicenseTransition key={ license.licenseKey }>
							<LicensePreview
								licenseKey={ license.licenseKey }
								product={ license.product }
								username={ license.username }
								blogId={ license.blogId }
								siteUrl={ license.siteUrl }
								issuedAt={ license.issuedAt }
								attachedAt={ license.attachedAt }
								revokedAt={ license.revokedAt }
								filter={ filter }
							/>
						</LicenseTransition>
					) ) }

				{ isFetching && (
					<LicenseTransition>
						<LicensePreviewPlaceholder />
					</LicenseTransition>
				) }

				{ showNoResults && (
					<LicenseTransition>
						<Card className="license-list__message" compact>
							<p>{ translate( 'No licenses found.' ) }</p>
						</Card>
					</LicenseTransition>
				) }

				{ showPagination && (
					<LicenseTransition>
						<Pagination
							className="license-list__pagination"
							page={ currentPage }
							perPage={ LICENSES_PER_PAGE }
							total={ licenses.totalItems }
							pageClick={ setPage }
						/>
					</LicenseTransition>
				) }
			</TransitionGroup>
		</div>
	);
}
