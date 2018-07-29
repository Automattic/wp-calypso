/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'gridicons';

/** Internal Dependencies */
import Spinner from 'components/spinner';

export default class extends React.Component {
	static displayName = 'PhoneInputCountryFlag';

	static propTypes = {
		countryCode: PropTypes.string.isRequired,
	};

	state = {
		ready: true,
		error: false,
	};

	componentDidUpdate( oldProps ) {
		if ( this.props.countryCode && this.props.countryCode !== oldProps.countryCode ) {
			this.setState( { ready: false, error: false } );
		}
	}

	renderSpinner = () => {
		if ( ( ! this.props.countryCode || ! this.state.ready ) && ! this.state.error ) {
			return <Spinner size={ 16 } className="phone-input__flag-spinner" />;
		}
	};

	handleImageLoad = () => {
		this.setState( { ready: true, error: false } );
	};

	handleImageError = () => {
		this.setState( { ready: false, error: true } );
	};

	renderFlag = () => {
		const style = this.state.ready ? {} : { visibility: 'hidden' };

		if ( this.props.countryCode ) {
			if ( ! this.state.error ) {
				const svg = require( 'svg-inline-loader!' +
					'../../../node_modules/flag-icon-css/flags/4x3/' +
					this.props.countryCode +
					'.svg' );
				console.log( svg );
				return <div dangerouslySetInnerHTML={ { __html: svg } } />;
			}
			return <Gridicon icon="globe" size={ 24 } className="phone-input__flag-icon" />;
		}
	};

	render() {
		return (
			<div className="phone-input__flag-container">
				{ this.renderSpinner() }
				{ this.renderFlag() }
				<Gridicon icon="chevron-down" size={ 12 } className="phone-input__flag-selector-icon" />
			</div>
		);
	}
}
