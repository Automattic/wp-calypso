/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { Dashicon } from '@wordpress/components';

Dashicon.displayName = 'Dashicon';

export default class extends React.Component {
	static displayName = 'Dashicon';

	static defaultProps = {
		exampleCode: (
			<div>
				<Dashicon icon="admin-home" />
				<Dashicon icon="products" />
				<Dashicon icon="wordpress" />
			</div>
		),
	};

	render() {
		return this.props.exampleCode;
	}
}
