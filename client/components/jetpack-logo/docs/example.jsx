/**
* External dependencies
*/
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import Card from 'components/card';

module.exports = React.createClass( {
	displayName: 'JetpackLogo',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/jetpack-logo">Jetpack Logo</a>
				</h2>
				<Card>
					<div>
						<JetpackLogo size={ 200 } />
						<JetpackLogo size={ 100 } />
						<JetpackLogo size={ 36 } />
					</div>
				</Card>
			</div>
		);
	}
} );
