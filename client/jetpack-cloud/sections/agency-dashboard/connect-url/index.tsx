import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import SitesInput from './sites-input';
import ValidateSites from './validate-sites';
import './style.scss';

export default function ConnectUrl() {
	const translate = useTranslate();

	const [ detectedSites, setDetectedSites ] = useState( [] );
	const [ detectedFilename, setDetectedFilename ] = useState( '' );
	const [ validating, setValidating ] = useState( false );

	const handleValidate = () => {
		setValidating( true );
	};

	const pageTitle = validating ? translate( 'Adding sites' ) : translate( 'Add sites by URL' );
	const pageSubtitle = validating
		? translate( 'Please wait while we add all sites to your account.' )
		: translate( 'Add one or multiple sites at once by entering their address below.' );

	return (
		<div className="connect-url">
			<h2 className="connect-url__page-title">{ pageTitle }</h2>
			<div className="connect-url__page-subtitle">{ pageSubtitle }</div>
			<Card>
				{ ! validating ? (
					<SitesInput
						{ ...{
							detectedSites,
							setDetectedSites,
							detectedFilename,
							setDetectedFilename,
							handleValidate,
						} }
					/>
				) : (
					<ValidateSites { ...{ detectedSites } } />
				) }
			</Card>
		</div>
	);
}
