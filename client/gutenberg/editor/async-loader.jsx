/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { mapValues } from 'lodash';

export const asyncLoader = ( { promises, loading, success, failure } ) =>
	class AsyncLoader extends Component {
		state = {
			results: mapValues( promises, () => null ),
		};

		componentDidMount() {
			// here we want to make sure all promises "resolve" even when
			// they reject because Promise.all will return a single value
			// on the first rejection instead of an array as when they all
			// resolve. this is for our own accounting and ensures that
			// we wait for all promises to fulfill
			const runners = Object.keys( promises ).map( key =>
				promises[ key ]
					.then( a => {
						this.setState( state => ( { results: { ...state.results, [ key ]: a } } ) );

						return a;
					} )
					.then( a => [ true, a ], a => [ false, a ] )
			);

			Promise.all( runners ).then( resolutions => {
				const keys = Object.keys( promises );
				const [ results, successful ] = resolutions.reduce(
					( [ output, allSuccess ], [ wasSuccess, data ], index ) => [
						{ ...output, [ keys[ index ] ]: data },
						allSuccess && wasSuccess,
					],
					[ {}, true ]
				);

				this.setState( { results, successful } );
			} );
		}

		render() {
			const { results, successful } = this.state;

			if ( true === successful ) {
				return success( results );
			}

			if ( false === successful ) {
				return failure( results );
			}

			return loading( results );
		}
	};
