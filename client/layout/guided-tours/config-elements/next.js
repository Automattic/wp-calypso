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

export default class Next extends Component {
	static displayName = 'Next';

	static propTypes = {
		step: PropTypes.string.isRequired,
		isButton: PropTypes.bool,
	};

	static defaultProps = {
		isButton: true,
	};

	static contextTypes = contextTypes;

	constructor( props, context ) {
		super( props, context );
	}

	onClick = () => {
		const { next, tour, tourVersion, step } = this.context;
		const { step: nextStepName } = this.props;
		next( { tour, tourVersion, step, nextStepName } );
	};

	render() {
		const { children, isButton } = this.props;
		const buttonClass = ! isButton ? 'config-elements__text-button' : '';

		return (
			<Button primary onClick={ this.onClick } className={ buttonClass }>
				{ children || translate( 'Next' ) }
			</Button>
		);
	}
}
