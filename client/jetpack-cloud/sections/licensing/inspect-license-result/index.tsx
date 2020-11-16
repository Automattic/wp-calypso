/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import QueryJetpackInspectLicense from 'calypso/components/data/query-jetpack-inspect-license';
import {
	getInspectedLicenseKey,
	getInspectionResult,
} from 'calypso/state/jetpack-licensing/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const InspectLicenseResult: React.FC = () => {
	const licenseKey = useSelector( getInspectedLicenseKey );
	const result = useSelector( getInspectionResult );

	if ( ! licenseKey ) {
		return null;
	}

	return (
		<>
			<QueryJetpackInspectLicense licenseKey={ licenseKey } />
			<Card>
				<pre className="inspect-license-result__pre">
					<code>{ result }</code>
				</pre>
			</Card>
		</>
	);
};

export default InspectLicenseResult;
