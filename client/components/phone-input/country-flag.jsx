/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import Gridicon from 'gridicons';

export default class extends PureComponent {
	static displayName = 'PhoneInputCountryFlag';

	static propTypes = {
		countryCode: PropTypes.string.isRequired,
	};

	render() {
		const { countryCode } = this.props;
		// don't confusingly split the import statement with its long string
		// note that webpack will parse this code at compile-time and auto-generate
		// a context for loading the SVGs. it will infer the file glob for all SVG
		// files in the given path and copy them to the public directory
		//
		// prettier-ignore
		const flagSvg = require( '../../../node_modules/flag-icon-css/flags/4x3/' + countryCode + '.svg' );

		return (
			<div className="phone-input__flag-container">
				<img alt="country flag" src={ flagSvg } className="phone-input__flag-icon" />
				<Gridicon icon="chevron-down" size={ 12 } className="phone-input__flag-selector-icon" />
			</div>
		);
	}
}
