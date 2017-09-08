/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Disconnect from './disconnect';
import Reconnect from './reconnect';

const DisconnectSurvey = () => {
	return (
		<div className="disconnect-site__survey">
			<Reconnect />
			<Disconnect />
		</div>
	);
};

export default localize( DisconnectSurvey );
