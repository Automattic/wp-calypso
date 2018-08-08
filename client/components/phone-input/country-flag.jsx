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

	static getDerivedStateFromProps( { countryCode }, state ) {
		if ( ! countryCode ) {
			return { flagSvg: null };
		}

		if ( countryCode !== state.countryCode ) {
			const flagSvg = require( 'svg-inline-loader!../../../node_modules/flag-icon-css/flags/4x3/' +
				countryCode +
				'.svg' );
			return { flagSvg };
		}
	}

	render() {
		const showSpinner = this.props.countryCode && ! this.state.flagSvg; // flag is specified but not here
		const showGeneric = ! this.props.countryCode; // flag isn't specified
		const hasFlag = this.props.countryCode && this.state.flagSvg; // loaded SVG

		return (
			<div className="phone-input__flag-container">
				{ showSpinner && <Spinner size={ 16 } className="phone-input__flag-spinner" /> }
				{ showGeneric && <Gridicon icon="globe" size={ 24 } className="phone-input__flag-icon" /> }
				{ hasFlag && (
					<div
						className="phone-input__flag-icon"
						dangerouslySetInnerHTML={ { __html: this.state.flagSvg } }
					/>
				) }
				<Gridicon icon="chevron-down" size={ 12 } className="phone-input__flag-selector-icon" />
			</div>
		);
	}
}
