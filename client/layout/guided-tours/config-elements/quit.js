/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import contextTypes from '../context-types';

export default class Quit extends Component {
	static displayName = 'Quit';

	static propTypes = {
		primary: PropTypes.bool,
		subtle: PropTypes.bool,
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	onClick = event => {
		this.props.onClick && this.props.onClick( event );
		const { quit, tour, tourVersion, step, isLastStep } = this.context;
		quit( { tour, tourVersion, step, isLastStep } );
	};

	render() {
		const { children, primary } = this.props;
		return (
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<Button className="guided-tours__quit-button" onClick={ this.onClick } primary={ primary }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
}
