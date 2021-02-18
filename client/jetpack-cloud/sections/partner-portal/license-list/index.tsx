/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
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
import Gridicon from 'calypso/components/gridicon';
import { addQueryArgs } from 'calypso/lib/route';

/**
 * Style dependencies
 */
import './style.scss';

interface LicenseTransitionProps {
	key?: string;
}

const LicenseTransition = ( props: React.PropsWithChildren< LicenseTransitionProps > ) => (
	<CSSTransition { ...props } classNames="license-list__license-transition" timeout={ 150 } />
);

interface Props {
	filter: LicenseFilter;
	search: string;
	sortField: LicenseSortField;
	sortDirection: LicenseSortDirection;
}

export default function LicenseList( {
	filter,
	search,
	sortField,
	sortDirection,
}: Props ): ReactElement {
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;
	const showLicenses = hasFetched && ! isFetching && !! licenses;
	const showNoResults = hasFetched && ! isFetching && licenses && licenses.items.length === 0;

	const setSortingConfig = ( field: LicenseSortField ): void => {
		let direction = LicenseSortDirection.Descending;

		if ( field === sortField && sortDirection === direction ) {
			direction = LicenseSortDirection.Ascending;
		}

		const queryParams = { sort_field: field, sort_direction: direction };
		const currentPath = window.location.pathname + window.location.search;

		page( addQueryArgs( queryParams, currentPath ) );
	};

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses filter={ filter } search={ search } />

			<LicenseListItem header className="license-list__header">
				<h2>{ translate( 'License state' ) }</h2>
				<h2 className={ classnames( { 'is-selected': LicenseSortField.IssuedAt === sortField } ) }>
					<button onClick={ () => setSortingConfig( LicenseSortField.IssuedAt ) }>
						{ translate( 'Issued on' ) }
						<Gridicon
							icon="dropdown"
							className={ classnames( 'license-list-item__sort-indicator', {
								[ `is-sort-${ sortDirection }` ]: true,
							} ) }
						/>
					</button>
				</h2>
				{ filter !== LicenseFilter.Revoked ? (
					<h2
						className={ classnames( { 'is-selected': LicenseSortField.AttachedAt === sortField } ) }
					>
						<button onClick={ () => setSortingConfig( LicenseSortField.AttachedAt ) }>
							{ translate( 'Attached on' ) }
							<Gridicon
								icon="dropdown"
								className={ classnames( 'license-list-item__sort-indicator', {
									[ `is-sort-${ sortDirection }` ]: true,
								} ) }
							/>
						</button>
					</h2>
				) : (
					<h2
						className={ classnames( { 'is-selected': LicenseSortField.RevokedAt === sortField } ) }
					>
						<button onClick={ () => setSortingConfig( LicenseSortField.RevokedAt ) }>
							{ translate( 'Revoked on' ) }
							<Gridicon
								icon="dropdown"
								className={ classnames( 'license-list-item__sort-indicator', {
									[ `is-sort-${ sortDirection }` ]: true,
								} ) }
							/>
						</button>
					</h2>
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
			</TransitionGroup>
		</div>
	);
}
