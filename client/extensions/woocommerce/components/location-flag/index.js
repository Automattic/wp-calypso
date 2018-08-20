/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class LocationFlag extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			ready: false,
		};
	}

	render() {
		const { code, className } = this.props;
		const { ready } = this.state;
		const flagSvg = require( `flag-icon-css/flags/4x3/${ code.toLowerCase() }.svg` );
		const style = ready ? {} : { visibility: 'hidden' };
		const onLoad = () => this.setState( { ready: true } );
		const onError = () => this.setState( { ready: false } );

		return (
			<img
				onLoad={ onLoad }
				onError={ onError }
				className={ classNames( 'location-flag', className ) }
				style={ style }
				src={ flagSvg }
				alt=""
			/>
		);
	}
}

LocationFlag.propTypes = {
	code: PropTypes.string.isRequired,
};

export default LocationFlag;
