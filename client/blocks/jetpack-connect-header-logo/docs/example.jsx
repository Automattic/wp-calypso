/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import JetpackConnectHeaderLogo from 'blocks/jetpack-connect-header-logo';

class JetpackConnectHeaderLogoExample extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			partnerSlug: '',
		};
	}

	onChange = event => {
		this.setState( {
			partnerSlug: event.target.value,
		} );
	};

	render() {
		const { partnerSlug } = this.state;
		return (
			<div className="design-assets__group">
				<JetpackConnectHeaderLogo partnerSlug={ partnerSlug } />
				<select onChange={ this.onChange } value={ partnerSlug }>
					<option value="">No Partner</option>
					<option value="dreamhost">DreamHost</option>
					<option value="pressable">Pressable</option>
					<option value="milesweb">Milesweb</option>
					<option value="bluehost">Bluehost</option>
					<option value="inmotion">InMotion</option>
				</select>
			</div>
		);
	}
}

JetpackConnectHeaderLogoExample.displayName = 'JetpackConnectHeaderLogo';

export default JetpackConnectHeaderLogoExample;
