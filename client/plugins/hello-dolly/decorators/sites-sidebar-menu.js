/**
 * External dependencies
 */
import React from 'react';
import { concat } from 'lodash';

/**
 * Internal dependencies
 */
import HelloDolly from 'plugins/hello-dolly/decorators/hello-dolly';

export default function HelloDollyDecorator( Base ) {
	return class extends React.Component {
		render() {
			const children = concat( this.props.extraChildren,
				<HelloDolly />
			);
			return <Base { ...this.props } extraChildren={ children } />;
		}
	};
}
