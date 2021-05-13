/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import PulsingDot from 'calypso/components/pulsing-dot';

/**
 * Style dependencies
 */
import './style.scss';

const GetToken: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<Main className="get-token">
			<div className="get-token__content">
				<PulsingDot active />
				<p>{ translate( 'Loading user…' ) }</p>
			</div>
		</Main>
	);
};

export default GetToken;
