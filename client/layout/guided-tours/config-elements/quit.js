/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { targetForSlug } from '../positioning';
import { contextTypes } from '../context-types';

export default class Quit extends Component {
	static displayName = 'Quit';

	static propTypes = {
		primary: PropTypes.bool,
		target: PropTypes.string,
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	componentDidMount() {
		this.addTargetListener();
	}

	componentWillUnmount() {
		this.removeTargetListener();
	}

	UNSAFE_componentWillUpdate() {
		this.removeTargetListener();
	}

	componentDidUpdate() {
		this.addTargetListener();
	}

	addTargetListener() {
		const { target = false } = this.props;
		const targetNode = targetForSlug( target );

		if ( targetNode && targetNode.addEventListener ) {
			targetNode.addEventListener( 'click', this.onClick );
			targetNode.addEventListener( 'touchstart', this.onClick );
		}
	}

	removeTargetListener() {
		const { target = false } = this.props;
		const targetNode = targetForSlug( target );

		if ( targetNode && targetNode.removeEventListener ) {
			targetNode.removeEventListener( 'click', this.onClick );
			targetNode.removeEventListener( 'touchstart', this.onClick );
		}
	}

	onClick = ( event ) => {
		this.props.onClick && this.props.onClick( event );
		const { quit, tour, tourVersion, step, isLastStep } = this.context;
		quit( { tour, tourVersion, step, isLastStep } );
	};

	render() {
		const { children, primary } = this.props;
		const classes = primary ? 'guided-tours__primary-button' : 'guided-tours__quit-button';
		return (
			<Button className={ classes } onClick={ this.onClick } primary={ primary }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
}
