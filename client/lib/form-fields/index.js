/**
 * External dependencies
 */
import React, { Component } from 'react';
import { union } from 'lodash';

export const formFields = WrappedComponent => {
	class FormFieldsComponent extends Component {
		state = {
			dirtyFields: [],
			fields: {}
		}

		updateFields = fields => {
			const newState = {
				dirtyFields: union( this.state.dirtyFields, Object.keys( fields ) ),
				fields: {
					...this.state.fields,
					...fields
				}
			};

			this.setState( newState );
		};

		clearDirtyFields = () => {
			this.setState( {
				dirtyFields: []
			} );
		}

		render() {
			const { fields, dirtyFields } = this.state;

			return (
				<WrappedComponent
					fields={ fields }
					dirtyFields={ dirtyFields }
					updateFields={ this.updateFields }
					clearDirtyFields={ this.clearDirtyFields }
					{ ...this.props }
				/>
			);
		}
	}

	return FormFieldsComponent;
};

export default formFields;
