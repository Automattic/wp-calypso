/**
 * External dependencies
 */
import { union } from 'lodash';
import React, { Component } from 'react';

export const trackForm = WrappedComponent => class TrackFormComponent extends Component {
	state = {
		dirtyFields: [],
		fields: {}
	};

	updateFields = ( fields, callback ) => {
		const newState = {
			dirtyFields: union( this.state.dirtyFields, Object.keys( fields ) ),
			fields: {
				...this.state.fields,
				...fields
			}
		};

		this.setState( newState, callback );
	};

	replaceFields = ( fields, callback, keepPrevFields = true ) => {
		const prevFields = keepPrevFields ? this.state.fields : {};
		const newFields = {
			...prevFields,
			...fields
		};

		this.setState( { fields: newFields }, callback );
	};

	clearDirtyFields = () => {
		this.setState( {
			dirtyFields: []
		} );
	};

	render() {
		const { fields, dirtyFields } = this.state;

		return (
			<WrappedComponent
				fields={ fields }
				dirtyFields={ dirtyFields }
				updateFields={ this.updateFields }
				replaceFields={ this.replaceFields }
				clearDirtyFields={ this.clearDirtyFields }
				{ ...this.props }
			/>
		);
	}
};

export default trackForm;
