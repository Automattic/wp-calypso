import { ReactElement, Fragment } from 'react';
import { useSelector } from 'react-redux';
import WhatIsJetpack from 'calypso/components/jetpack/what-is-jetpack';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

export default function JetpackSearchFooter(): ReactElement | null {
	const siteId = useSelector( getSelectedSiteId );
	const isWPCOM = useSelector( ( state ) => getIsSiteWPCOM( state, siteId ) );
	const isCloud = isJetpackCloud();

	// Don't display this footer in Jetpack Cloud or for non-WordPress.com sites
	if ( isCloud || ! isWPCOM ) {
		return null;
	}

	return (
		<Fragment>
			<WhatIsJetpack />
		</Fragment>
	);
}
