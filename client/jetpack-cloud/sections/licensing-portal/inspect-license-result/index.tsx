/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import QueryJetpackInspectLicense from 'calypso/components/data/query-jetpack-inspect-license';
import {
	getInspectedLicenseKey,
	getInspectionResult,
	isInspecting as isInspectingSelector,
	getInspectionError,
} from 'calypso/state/licensing-portal/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const InspectLicenseResult: React.FC = () => {
	const licenseKey = useSelector( getInspectedLicenseKey );
	const result = useSelector( getInspectionResult );
	const error = useSelector( getInspectionError );
	const isInspecting = useSelector( isInspectingSelector );

	if ( ! licenseKey ) {
		return null;
	}

	return (
		<>
			<QueryJetpackInspectLicense licenseKey={ licenseKey } />
			<Card className="inspect-license-result">
				<CardHeading>{ licenseKey }</CardHeading>

				{ isInspecting && <Spinner /> }

				{ error && (
					<pre className="inspect-license-result__pre">
						<code>{ error }</code>
					</pre>
				) }

				{ result && (
					<pre className="inspect-license-result__pre">
						<code>{ result }</code>
					</pre>
				) }
			</Card>
		</>
	);
};

export default InspectLicenseResult;
