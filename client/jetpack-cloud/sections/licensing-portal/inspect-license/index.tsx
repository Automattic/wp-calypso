/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import InspectLicenseForm from 'calypso/jetpack-cloud/sections/licensing-portal/inspect-license-form';
import InspectLicenseResult from 'calypso/jetpack-cloud/sections/licensing-portal/inspect-license-result';

export default function InspectLicense() {
	return (
		<Main>
			<InspectLicenseForm />
			<InspectLicenseResult />
		</Main>
	);
}
