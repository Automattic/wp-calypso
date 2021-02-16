/**
 * External dependencies
 */
import React, { ReactElement, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

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

/**
 * Style dependencies
 */
import './style.scss';

export default function LicenseList(): ReactElement {
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;
	const [ sortConfig, setSortConfig ] = useState( { direction: 'asc', field: 'attached_at' } );

	const onSort = ( newSortField: string ): void => {
		let newSortDirection = 'asc';

		if ( sortConfig.field === newSortField ) {
			newSortDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
		}

		setSortConfig( { field: newSortField, direction: newSortDirection } );
	};

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses />

			<LicenseListItem header>
				<h2>{ translate( 'License state' ) }</h2>
				<h2>
					<button onClick={ () => onSort( 'issued_at' ) }>
						{ translate( 'Issued on' ) }
						<Gridicon icon="dropdown" />
					</button>
				</h2>
				<h2>
					<button onClick={ () => onSort( 'attached_at' ) }>
						{ translate( 'Attached on' ) }
						<Gridicon icon="dropdown" />
					</button>
				</h2>
				<h2>
					<button onClick={ () => onSort( 'revoked_at' ) }>
						{ translate( 'Revoked on' ) }
						<Gridicon icon="dropdown" />
					</button>
				</h2>
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
