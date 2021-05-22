/**
 * External dependencies
 */
import { Component } from 'react';
import { map, mapValues } from 'lodash';

export const asyncLoader = ( { promises, loading, success, failure } ) =>
	class AsyncLoader extends Component {
		state = {
			results: mapValues( promises, () => null ),
		};

		componentDidMount() {
			this._isMounted = true;

			// here we want to make sure all promises "resolve" even when
			// they reject because Promise.all will return a single value
			// on the first rejection instead of an array as when they all
			// resolve. this is for our own accounting and ensures that
			// we wait for all promises to fulfill
			const runners = map( promises, ( promise, key ) =>
				promise
					.then( ( a ) => {
						if ( this._isMounted ) {
							this.setState( ( state ) => ( { results: { ...state.results, [ key ]: a } } ) );
						}

						return a;
					} )
					.then(
						( a ) => [ true, a, key ],
						( a ) => [ false, a, key ]
					)
			);

			Promise.all( runners ).then( ( resolutions ) => {
				const [ results, successful ] = resolutions.reduce(
					( [ output, allSuccess ], [ wasSuccess, data, key ] ) => [
						{ ...output, [ key ]: data },
						allSuccess && wasSuccess,
					],
					[ {}, true ]
				);

				if ( this._isMounted ) {
					this.setState( { results, successful } );
				}
			} );
		}

		componentWillUnmount() {
			this._isMounted = false;
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
