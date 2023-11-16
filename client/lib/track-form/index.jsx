import debugFactory from 'debug';
import { Component } from 'react';

const debug = debugFactory( 'calypso:track-form' );

export const trackForm = ( WrappedComponent ) =>
	class TrackFormComponent extends Component {
		state = {
			dirtyFields: [],
			fields: {},
		};

		updateFields = ( fields, callback ) => {
			this.setState( ( prevState ) => {
				const newState = {
					dirtyFields: [ ...new Set( [].concat( prevState.dirtyFields, Object.keys( fields ) ) ) ],
					fields: {
						...prevState.fields,
						...fields,
					},
				};
				debug( 'updateFields', { fields, newState } );
				return newState;
			}, callback );
		};

		replaceFields = ( fields, callback, keepPrevFields = true ) => {
			debug( 'replaceFields', { fields, keepPrevFields } );
			this.setState( ( prevState ) => {
				const prevFields = keepPrevFields ? prevState.fields : {};
				const newFields = {
					...prevFields,
					...fields,
				};
				return { fields: newFields };
			}, callback );
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
