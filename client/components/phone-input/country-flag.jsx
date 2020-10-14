/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import Spinner from 'calypso/components/spinner';
import { flagUrl } from 'calypso/lib/flags';

export default class extends React.Component {
	static displayName = 'PhoneInputCountryFlag';

	static propTypes = {
		countryCode: PropTypes.string.isRequired,
	};

	state = {
		ready: false,
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
		const { countryCode } = this.props;

		if ( countryCode ) {
			if ( ! this.state.error ) {
				return (
					<img
						alt=""
						onLoad={ this.handleImageLoad }
						onError={ this.handleImageError }
						src={ flagUrl( countryCode ) }
						className="phone-input__flag-icon"
						style={ style }
					/>
				);
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
