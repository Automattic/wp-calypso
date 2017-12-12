/** @format */
/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';

export default function JetpackLogoExample() {
	return (
		<div>
			<div>
				<JetpackLogo full size={ 24 } /> size = 24
			</div>
			<div>
				<JetpackLogo size={ 32 } /> size = 32
			</div>
			<div>
				<JetpackLogo size={ 40 } /> size = 40
			</div>
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
