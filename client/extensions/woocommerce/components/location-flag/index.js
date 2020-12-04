/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { flagUrl } from 'calypso/lib/flags';

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
		const style = ready ? {} : { visibility: 'hidden' };
		const onLoad = () => this.setState( { ready: true } );
		const onError = () => this.setState( { ready: false } );

		return (
			<img
				onLoad={ onLoad }
				onError={ onError }
				className={ classNames( 'location-flag', className ) }
				style={ style }
				src={ flagUrl( code.toLowerCase() ) }
				alt=""
			/>
		);
	}
}

LocationFlag.propTypes = {
	code: PropTypes.string.isRequired,
};

export default LocationFlag;
