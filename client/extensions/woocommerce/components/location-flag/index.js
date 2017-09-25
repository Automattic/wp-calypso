/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

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
		const onLoad = () => ( this.setState( { ready: true } ) );
		const onError = () => ( this.setState( { ready: false } ) );

		return (
			<img
				onLoad={ onLoad }
				onError={ onError }
				className={ classNames( 'location-flag', className ) }
				style={ style }
				src={ `/calypso/images/flags/${ code.toLowerCase() }.svg` } />
		);
	}
}

LocationFlag.propTypes = {
	code: PropTypes.string.isRequired,
};

export default LocationFlag;
