/**
 * External dependencies
 */

import React from 'react';
import { camelCase, kebabCase, upperFirst } from 'lodash';

/**
 * Internal dependencies
 */
import SyncInitialize from 'lib/form-state/examples/sync-initialize';
import AsyncInitialize from 'lib/form-state/examples/async-initialize';

const COMPONENTS = {
	SyncInitialize,
	AsyncInitialize,
};

class FormStateExamples extends React.Component {
	render() {
		return this.props.component ? this.component() : this.list();
	}

	list() {
		const items = Object.keys( COMPONENTS ).map( ( componentName ) => {
			return (
				<li key={ componentName }>
					<a href={ 'form-state-examples/' + kebabCase( componentName ) }>{ componentName }</a>
				</li>
			);
		} );

		return (
			<div>
				<h1>Form State Examples</h1>
				<ul>{ items }</ul>
			</div>
		);
	}

	component() {
		const componentName = upperFirst( camelCase( this.props.component ) ),
			ComponentClass = COMPONENTS[ componentName ];

		return (
			<div>
				<h1>{ componentName }</h1>
				<ComponentClass />
			</div>
		);
	}
}

export default FormStateExamples;
