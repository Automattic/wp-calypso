/**
 * External dependencies
 */
import React, { Component } from 'react';
import { union } from 'lodash';

export const trackForm = WrappedComponent => {
	class TrackFormComponent extends Component {
		state = {
			dirtyFields: [],
			fields: {}
		};

		updateFields = ( fields, updateDirtyFields = true, callback ) => {
			const newState = {
				dirtyFields: updateDirtyFields
					? union( this.state.dirtyFields, Object.keys( fields ) )
					: this.state.dirtyFields,
				fields: {
					...this.state.fields,
					...fields
				}
			};

			this.setState( newState, callback );
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
					clearDirtyFields={ this.clearDirtyFields }
					{ ...this.props }
				/>
			);
		}
	}

	return TrackFormComponent;
};

export default trackForm;
