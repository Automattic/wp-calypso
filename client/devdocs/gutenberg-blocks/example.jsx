/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { GutenbergBlock } from 'gutenberg-blocks';

class GutenbergBlockExample extends PureComponent {
	static defaultProps = {
		exampleCode: <GutenbergBlock name="name" attributes="attributes" />,
	};

	render() {
		return <GutenbergBlock name={ this.props.name } attributes={ this.props.attributes } />;
	}
}

export default GutenbergBlockExample;
