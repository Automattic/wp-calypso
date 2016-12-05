/**
 * External dependencies
 */
import React, { Component } from 'react';
import { noop, union } from 'lodash';

export const trackForm = WrappedComponent => {
	class TrackFormComponent extends Component {
		state = {
			dirtyFields: [],
			fields: {}
		};

		updateFields = ( fields, callback = noop ) => {
			const newState = {
				dirtyFields: union( this.state.dirtyFields, Object.keys( fields ) ),
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
