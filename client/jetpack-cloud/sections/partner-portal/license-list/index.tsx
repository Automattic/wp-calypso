/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { pick } from 'lodash';
import url from 'url'; // eslint-disable-line no-restricted-imports
import page from 'page';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { License, PaginatedItems } from 'calypso/state/partner-portal/types';
import QueryJetpackPartnerPortalLicenses from 'calypso/components/data/query-jetpack-partner-portal-licenses';
import {
	hasFetchedLicenses,
	isFetchingLicenses,
	getPaginatedLicenses,
} from 'calypso/state/partner-portal/licenses/selectors';
import LicenseListItem from 'calypso/jetpack-cloud/sections/partner-portal/license-list-item';
import LicensePreview, {
	LicensePreviewPlaceholder,
} from 'calypso/jetpack-cloud/sections/partner-portal/license-preview';
import Gridicon from 'calypso/components/gridicon';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	licenseFilter: LicenseFilter;
	sortDirection: string;
	sortField: string;
}

export default function LicenseList( {
	licenseFilter,
	sortDirection,
	sortField,
}: Props ): ReactElement {
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;

	const buildSortingUrl = ( field: string, direction: string ): string => {
		const parsedUrl = pick( url.parse( window.location.href, true ), 'pathname', 'query' );

		return url.format( {
			...parsedUrl,
			query: { ...parsedUrl.query, sort_field: field, sort_direction: direction },
		} );
	};

	const setSortingConfig = ( newSortField: string ): void => {
		let newSortDirection = 'asc';

		if ( sortField === newSortField ) {
			newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		}

		page( buildSortingUrl( newSortField, newSortDirection ) );
	};

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses />

			<LicenseListItem header className="license-list__header">
				<h2>{ translate( 'License state' ) }</h2>
				<h2 className={ classnames( { 'is-selected': 'issued_at' === sortField } ) }>
					<button onClick={ () => setSortingConfig( 'issued_at' ) }>
						{ translate( 'Issued on' ) }
						<Gridicon
							icon="dropdown"
							className={ classnames( 'license-list-item__sort-indicator', {
								[ `is-sort-${ sortDirection }` ]: sortDirection,
							} ) }
						/>
					</button>
				</h2>
				{ licenseFilter !== LicenseFilter.Revoked ? (
					<h2 className={ classnames( { 'is-selected': 'attached_at' === sortField } ) }>
						<button onClick={ () => setSortingConfig( 'attached_at' ) }>
							{ translate( 'Attached on' ) }
							<Gridicon
								icon="dropdown"
								className={ classnames( 'license-list-item__sort-indicator', {
									[ `is-sort-${ sortDirection }` ]: sortDirection,
								} ) }
							/>
						</button>
					</h2>
				) : (
					<h2 className={ classnames( { 'is-selected': 'revoked_at' === sortField } ) }>
						<button onClick={ () => setSortingConfig( 'revoked_at' ) }>
							{ translate( 'Revoked on' ) }
							<Gridicon
								icon="dropdown"
								className={ classnames( 'license-list-item__sort-indicator', {
									[ `is-sort-${ sortDirection }` ]: sortDirection,
								} ) }
							/>
						</button>
					</h2>
				) }
				<div>{ /* Intentionally empty header. */ }</div>
				<div>{ /* Intentionally empty header. */ }</div>
			</LicenseListItem>

			{ ! hasFetched && isFetching && (
				<>
					<LicensePreviewPlaceholder />
					<LicensePreviewPlaceholder />
					<LicensePreviewPlaceholder />
				</>
			) }

			{ hasFetched &&
				licenses &&
				licenses.items.map( ( license ) => (
					<LicensePreview
						key={ license.licenseKey }
						licenseKey={ license.licenseKey }
						product={ license.product }
						username={ license.username }
						blogId={ license.blogId }
						siteUrl={ license.siteUrl }
						issuedAt={ license.issuedAt }
						attachedAt={ license.attachedAt }
						revokedAt={ license.revokedAt }
						licenseFilter={ licenseFilter }
					/>
				) ) }

			{ hasFetched && licenses && licenses.items.length === 0 && (
				<Card className="license-list__message" compact>
					{ translate( 'No licenses found.' ) }
				</Card>
			) }
		</div>
	);
}
