/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getLicenseCounts } from 'calypso/state/partner-portal/licenses/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { LicenseFilter } from 'calypso/jetpack-cloud/sections/partner-portal/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	filter: LicenseFilter;
}

export default function LicenseListEmpty( { filter }: Props ): ReactElement {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const counts = useSelector( getLicenseCounts );
	const hasAssignedLicenses = counts[ LicenseFilter.Attached ] > 0;

	const licenseFilterStatusTitleMap = {
		[ LicenseFilter.NotRevoked ]: translate( 'No active licenses' ),
		[ LicenseFilter.Attached ]: translate( 'No assigned licenses.' ),
		[ LicenseFilter.Detached ]: translate( 'No unassigned licenses.' ),
		[ LicenseFilter.Revoked ]: translate( 'No revoked licenses.' ),
	};

	const licenseFilterStatusTitle = licenseFilterStatusTitleMap[ filter ] as string;

	const onIssueNewLicense = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_empty_issue_license_click' )
		);
	};

	return (
		<div className="license-list__empty-list">
			<h2>{ licenseFilterStatusTitle }</h2>
			{ filter === LicenseFilter.Detached && hasAssignedLicenses && (
				<p>{ translate( 'Every license you own is currently attached to a site.' ) }</p>
			) }
			<Button href="/partner-portal/issue-license" onClick={ onIssueNewLicense }>
				{ translate( 'Issue New License' ) }
			</Button>
		</div>
	);
}
