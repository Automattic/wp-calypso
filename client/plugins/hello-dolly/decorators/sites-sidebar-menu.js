/**
 * External dependencies
 */
import React from 'react';
import { concat } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import HelloDolly from 'plugins/hello-dolly/decorators/hello-dolly';

export default function HelloDollyDecorator( Base ) {
	const style = {
		display: 'inline-block',
		maxWidth: 'calc(100% - 20px)',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	};

	return class extends React.Component {
		render() {
			const children = concat( this.props.extraChildren,
				<Card compact={ true }>
					<span style={ style }>
						<HelloDolly />
					</span>
				</Card>
			);
			return <Base { ...this.props } extraChildren={ children } />;
		}
	};
}
