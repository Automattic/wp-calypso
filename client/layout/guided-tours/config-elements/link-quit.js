/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { translate } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import contextTypes from '../context-types';

export default class LinkQuit extends Component {
	static propTypes = {
		children: PropTypes.node,
		primary: PropTypes.bool,
		subtle: PropTypes.bool,
		href: PropTypes.string,
		target: PropTypes.string,
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	onClick = ( event ) => {
		this.props.onClick && this.props.onClick( event );
		const { quit, tour, tourVersion, step, isLastStep } = this.context;
		quit( { tour, tourVersion, step, isLastStep } );
	}

	render() {
		const { children, primary, subtle, href, target } = this.props;
		const classes = classNames( 'guided-tours__button-link', {
			'guided-tours__subtle-button': subtle
		} );

		return (
			<Button
				className={ classes }
				onClick={ this.onClick }
				primary={ primary }
				href={ href }
				target={ target }>
				{ children || translate( 'Quit' ) }
			</Button>
		);
	}
}
