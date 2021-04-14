/**
 * External dependencies
 */
import React, { ReactElement, Fragment } from 'react';

/**
 * Internal dependencies
 */
import JetpackSearchInstantSearchVisualConfig from './visual';
import JetpackSearchInstantSearchBehavioralConfig from './behavioral';
import JetpackSearchInstantSearchAdditionalConfig from './additional';

export default function JetpackSearchInstantSearchConfig(): ReactElement {
	return (
		<Fragment>
			<JetpackSearchInstantSearchVisualConfig />
			<JetpackSearchInstantSearchBehavioralConfig />
			<JetpackSearchInstantSearchAdditionalConfig />
		</Fragment>
	);
}
