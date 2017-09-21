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
				<p>
					<code>{ '<JetpackLogo full size={ 24 } />' }</code>
				</p>
				<JetpackLogo full size={ 24 } />
			</div>
			<div>
				<p>
					<code>{ '<JetpackLogo size={ 40 } />' }</code>
				</p>
				<JetpackLogo size={ 40 } />
			</div>
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
