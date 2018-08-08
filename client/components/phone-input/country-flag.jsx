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
		this.updateFlag( null, this.props.countryCode );
	}

	componentDidUpdate( prevProps ) {
		this.updateFlag( prevProps.countryCode, this.props.countryCode );
	}

	updateFlag = ( prevCode, nextCode ) => {
		if ( prevCode !== nextCode ) {
			// don't confusingly split this import statement with its long string
			// prettier-ignore
			import(
				/* webpackChunkName: "svg-flag-[request]" */
				'svg-url-loader?noquotes!../../../node_modules/flag-icon-css/flags/4x3/' + nextCode + '.svg'
			).then(
				( { default: flagSvg } ) => this.setState( { flagSvg } ),
				() => this.setState( { flagSvg: false } ),
			);

			// called synchronously before the dynamic import loads
			this.setState( { flagSvg: null } );
		}
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
