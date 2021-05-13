/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackPlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';

export default function JetpackPlusWpComLogoExample() {
	return (
		<div>
			<pre>{ '<JetpackPlusWpComLogo />' }</pre>
			<JetpackPlusWpComLogo />
			<hr />
			<pre>{ '<JetpackPlusWpComLogo size={ 24 } />' }</pre>
			<JetpackPlusWpComLogo size={ 24 } />
			<hr />
			<pre>{ '<JetpackPlusWpComLogo size={ 64 } />' }</pre>
			<JetpackPlusWpComLogo size={ 64 } />
		</div>
	);
}
JetpackPlusWpComLogoExample.displayName = 'JetpackPlusWpComLogoExample';
