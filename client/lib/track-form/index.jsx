/**
 * External dependencies
 */
import React, { Component } from 'react';
import { union } from 'lodash';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:track-form' );

export const trackForm = ( WrappedComponent ) =>
	class TrackFormComponent extends Component {
		state = {
			dirtyFields: [],
			fields: {},
		};

		updateFields = ( fields, callback ) => {
			const newState = {
				dirtyFields: union( this.state.dirtyFields, Object.keys( fields ) ),
				fields: {
					...this.state.fields,
					...fields,
				},
			};
			debug( 'updateFields', { fields, newState } );

			this.setState( newState, callback );
		};

		replaceFields = ( fields, callback, keepPrevFields = true ) => {
			debug( 'replaceFields', { fields, keepPrevFields } );
			const prevFields = keepPrevFields ? this.state.fields : {};
			const newFields = {
				...prevFields,
				...fields,
			};

			this.setState( { fields: newFields }, callback );
		};

		clearDirtyFields = () => {
			debug( 'clearDirtyFields' );
			this.setState( {
				dirtyFields: [],
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
