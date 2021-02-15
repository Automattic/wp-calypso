/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { License, PaginatedItems } from 'calypso/state/partner-portal';
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

/**
 * Style dependencies
 */
import './style.scss';

export default function LicenseList(): ReactElement {
	const translate = useTranslate();
	const hasFetched = useSelector( hasFetchedLicenses );
	const isFetching = useSelector( isFetchingLicenses );
	const licenses = useSelector( getPaginatedLicenses ) as PaginatedItems< License >;

	return (
		<div className="license-list">
			<QueryJetpackPartnerPortalLicenses />

			<LicenseListItem header>
				<h2>{ translate( 'License state' ) }</h2>
				<h2>{ translate( 'Issued on' ) }</h2>
				<h2>{ translate( 'Attached on' ) }</h2>
				<h2>{ translate( 'Revoked on' ) }</h2>
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
