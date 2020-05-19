/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import Main from 'components/main';
import PulsingDot from 'components/pulsing-dot';

const GetToken: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<Main className="get-token">
			<JetpackLogo full monochrome={ false } size={ 72 } />
			<p>{ translate( 'Loading user…' ) }</p>
			<PulsingDot active />
		</Main>
	);
};

export default GetToken;
