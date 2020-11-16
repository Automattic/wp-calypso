/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import InspectLicenseForm from 'calypso/jetpack-cloud/sections/licensing/inspect-license-form';
import InspectLicenseResult from 'calypso/jetpack-cloud/sections/licensing/inspect-license-result';

/**
 * Style dependencies
 */
import './style.scss';

const InspectLicense: React.FC = () => {
	return (
		<Main className="inspect-licenses">
			<InspectLicenseForm />
			<InspectLicenseResult result={ JSON.stringify( { foo: 'bar', baz: 'foobarbaz' } ) } />
		</Main>
	);
};

export default InspectLicense;
