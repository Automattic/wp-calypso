import { Dialog } from '@automattic/components';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import QueryJetpackUserLicenses from 'calypso/components/data/query-jetpack-user-licenses';
import QueryJetpackUserLicensesCounts from 'calypso/components/data/query-jetpack-user-licenses-counts';
import {
	getUserLicenses,
	getUserLicensesCounts,
	userHasDetachedLicenses,
} from 'calypso/state/user-licensing/selectors';

function LicensingPromptDialog() {
	const hasDetachedLicenses = useSelector( userHasDetachedLicenses );
	const userLicenses = useSelector( getUserLicenses );
	const userLicensesCounts = useSelector( getUserLicensesCounts );
	const [ showLicensesDialog, setShowLicensesDialog ] = useState< boolean >( false );

	const hasOneDetachedLicense = userLicensesCounts && userLicensesCounts[ 'detached' ] === 1;

	const detachedUserLicense =
		userLicenses &&
		hasOneDetachedLicense &&
		Object.values( userLicenses.items ).filter( ( { attachedAt } ) => attachedAt === null )[ 0 ];

	useEffect( () => {
		if ( hasDetachedLicenses ) {
			setShowLicensesDialog( true );
		}
	}, [ hasDetachedLicenses ] );

	return (
		<>
			<QueryJetpackUserLicenses />
			<QueryJetpackUserLicensesCounts />
			<Dialog isVisible={ showLicensesDialog } onClose={ () => setShowLicensesDialog( false ) }>
				<h1>Hey!</h1>
				<pre>{ JSON.stringify( detachedUserLicense, null, 2 ) }</pre>
			</Dialog>
		</>
	);
}

export default LicensingPromptDialog;
