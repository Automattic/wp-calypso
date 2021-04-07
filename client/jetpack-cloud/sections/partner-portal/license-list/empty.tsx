/**
 * External dependencies
 */
import React, { ReactElement, useContext } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getLicenseCounts } from 'calypso/state/partner-portal/licenses/selectors';
import LicenseListContext from 'calypso/jetpack-cloud/sections/partner-portal/license-list-context';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Style dependencies
 */
import './style.scss';

export default function LicenseListEmpty(): ReactElement {
	const translate = useTranslate();
	const { filter } = useContext( LicenseListContext );
	const counts = useSelector( getLicenseCounts );
	const hasAssignedLicenses = counts[ LicenseFilter.Attached ] > 0;

	const licenseFilterStatusMap = {
		[ LicenseFilter.NotRevoked ]: translate( 'Active' ),
		[ LicenseFilter.Attached ]: translate( 'Assigned' ),
		[ LicenseFilter.Detached ]: translate( 'Unassigned' ),
		[ LicenseFilter.Revoked ]: translate( 'Revoked' ),
	};

	const licenseFilterStatus = licenseFilterStatusMap[ filter ] as string;

	// translators: %(status)s is the current "status" of a license. One of active, assigned, unassigned, or revoked.
	const titleText = translate( 'No %(status)s licenses.', {
		// Using `toLowerCase` to reuse the strings above and avoid retranslation
		args: { status: licenseFilterStatus.toLowerCase() },
	} );

	return (
		<div className="license-list__empty-list">
			<h2>{ titleText }</h2>
			{ filter === LicenseFilter.Detached && hasAssignedLicenses && (
				<p>{ translate( 'Every license you own is currently attached to a site.' ) }</p>
			) }
			<Button href="/partner-portal/issue-license">{ translate( 'Issue New License' ) }</Button>
		</div>
	);
}
