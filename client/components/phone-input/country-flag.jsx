/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';
/** Internal Dependencies */
import Spinner from 'components/spinner';

export default class extends Component {
	static displayName = 'PhoneInputCountryFlag';

	static propTypes = {
		countryCode: PropTypes.string.isRequired,
	};

	state = {
		flagSvg: null,
	};

	componentDidMount() {
		this.updateFlag();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.countryCode !== this.props.countryCode ) {
			this.updateFlag();
		}
	}

	updateFlag = () => {
		this.setState( { flagSvg: null }, () => {
			// don't confusingly split the import statement with its long string
			// note that webpack will parse this code at compile-time and auto-generate
			// a context for loading the SVGs. it will infer the file glob for all SVG
			// files in the given path and should make a separate bundle for each one
			//
			// also, the "noquotes" part of the loader tells it that we're consuming
			// the SVG data-uri as a JavaScript value and not as a string
			// see the docs for `svg-url-loader` for more information
			//
			// prettier-ignore
			import(
				/* webpackChunkName: "svg-flag-[request]" */
				'svg-url-loader?noquotes!../../../node_modules/flag-icon-css/flags/4x3/' + this.props.countryCode + '.svg'
			).then(
				( { default: flagSvg } ) => this.setState( { flagSvg } ),
				() => this.setState( { flagSvg: false } )
			)
		} );
	};

	render() {
		const { countryCode } = this.props;
		const { flagSvg } = this.state;

		const showSpinner = countryCode && null === flagSvg; // flag is specified but not here
		const showGeneric = ! countryCode || false === flagSvg; // flag isn't specified or failed to load
		const hasSvg = countryCode && flagSvg; // loaded SVG as data-uri

		return (
			<div className="phone-input__flag-container">
				{ showSpinner && <Spinner size={ 16 } className="phone-input__flag-spinner" /> }
				{ showGeneric && <Gridicon icon="globe" size={ 24 } className="phone-input__flag-icon" /> }
				{ hasSvg && <img alt="country flag" src={ flagSvg } className="phone-input__flag-icon" /> }
				<Gridicon icon="chevron-down" size={ 12 } className="phone-input__flag-selector-icon" />
			</div>
		);
	}
}
