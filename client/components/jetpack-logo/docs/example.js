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
					<code>
						{ '<JetpackLogo full />' }
					</code>
				</p>
				<JetpackLogo full />
			</div>
			<div>
				<p>
					<code>
						{ '<JetpackLogo />' }
					</code>
				</p>
				<JetpackLogo />
			</div>
		</div>
	);
}
JetpackLogoExample.displayName = 'JetpackLogoExample';
