/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SyncInitialize from 'calypso/lib/form-state/examples/sync-initialize';
import AsyncInitialize from 'calypso/lib/form-state/examples/async-initialize';

const COMPONENTS = {
	'sync-initialize': SyncInitialize,
	'async-initialize': AsyncInitialize,
};

class FormStateExamples extends React.Component {
	render() {
		return this.props.component ? this.component() : this.list();
	}

	list() {
		const items = Object.keys( COMPONENTS ).map( ( componentName ) => {
			return (
				<li key={ componentName }>
					<a href={ 'form-state-examples/' + componentName }>
						{ COMPONENTS[ componentName ].name }
					</a>
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
		const ComponentClass = COMPONENTS[ this.props.component ];

		if ( ! ComponentClass ) {
			return null;
		}

		return (
			<div>
				<h1>{ ComponentClass.name }</h1>
				<ComponentClass />
			</div>
		);
	}
}

export default FormStateExamples;
