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
			<pre>{ '<JetpackLogo />' }</pre>
			<JetpackLogo />
			<hr />
			<pre>{ '<JetpackLogo size={ 24 } />' }</pre>
			<JetpackLogo size={ 24 } />
			<hr />
			<pre>{ '<JetpackLogo full size={ 64 } />' }</pre>
			<JetpackLogo full size={ 64 } />
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
