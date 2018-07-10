/**
 * External dependencies
 */
import { mapValues, reduce, forEach, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import request, { getCachedResponse } from './request';
import { getRoute } from './routes';

export default ( mapPropsToData ) => createHigherOrderComponent( ( WrappedComponent ) => {
	class APIDataComponent extends Component {
		constructor( props, context ) {
			super( ...arguments );
			this.schema = context.getAPISchema();
			this.routeHelpers = mapValues( {
				type: context.getAPIPostTypeRestBaseMapping(),
				taxonomy: context.getAPITaxonomyRestBaseMapping(),
			}, ( mapping ) => ( key ) => mapping[ key ] );
			this.state = {
				dataProps: this.applyMapping( props ),
			};
			this.isStillMounted = true;
		}

		componentDidMount() {
			this.initializeFetchable( {} );
		}

		componentDidUpdate( prevProps, prevState ) {
			if ( ! isShallowEqual( prevProps, this.props ) ) {
				const dataProps = this.applyMapping( this.props, this.state.dataProps );
				this.setState( { dataProps } );
			}
			this.initializeFetchable( prevState.dataProps );
		}

		componentWillUnmount() {
			this.isStillMounted = false;
		}

		initializeFetchable( prevDataProps ) {
			const { dataProps } = this.state;

			// Trigger first fetch on initial entries into state. Assumes GET
			// request by presence of isLoading flag.
			forEach( dataProps, ( dataProp, propName ) => {
				if (
					prevDataProps.hasOwnProperty( propName ) &&
					prevDataProps[ propName ].path === dataProp.path
				) {
					return;
				}

				// Skip request is already assigned via cache
				if ( dataProp[ this.getResponseDataKey( 'GET' ) ] ) {
					return;
				}

				if ( this.getPendingKey( 'GET' ) in dataProp ) {
					dataProp[ this.getRequestKey( 'GET' ) ]();
				}
			} );
		}

		setIntoDataProp( propName, values ) {
			if ( ! this.isStillMounted ) {
				return;
			}

			this.setState( ( prevState ) => {
				const { dataProps } = prevState;
				return {
					dataProps: {
						...dataProps,
						[ propName ]: {
							...dataProps[ propName ],
							...values,
						},
					},
				};
			} );
		}

		getRequestKey( method ) {
			switch ( method ) {
				case 'GET': return 'get';
				case 'POST': return 'create';
				case 'PUT': return 'save';
				case 'PATCH': return 'patch';
				case 'DELETE': return 'delete';
			}
		}

		getPendingKey( method ) {
			switch ( method ) {
				case 'GET': return 'isLoading';
				case 'POST': return 'isCreating';
				case 'PUT': return 'isSaving';
				case 'PATCH': return 'isPatching';
				case 'DELETE': return 'isDeleting';
			}
		}

		getResponseDataKey( method ) {
			switch ( method ) {
				case 'GET': return 'data';
				case 'POST': return 'createdData';
				case 'PUT': return 'savedData';
				case 'PATCH': return 'patchedData';
				case 'DELETE': return 'deletedData';
			}
		}

		getErrorResponseKey( method ) {
			switch ( method ) {
				case 'GET': return 'error';
				case 'POST': return 'createError';
				case 'PUT': return 'saveError';
				case 'PATCH': return 'patchError';
				case 'DELETE': return 'deleteError';
			}
		}

		request( propName, method, path ) {
			this.setIntoDataProp( propName, {
				[ this.getPendingKey( method ) ]: true,
			} );

			request( { path, method } )
				// [Success] Set the data prop:
				.then( ( response ) => ( {
					[ this.getResponseDataKey( method ) ]: response.body,
				} ) )

				// [Failure] Set the error prop:
				.catch( ( error ) => ( {
					[ this.getErrorResponseKey( method ) ]: error,
				} ) )

				// Always reset loading prop:
				.then( ( nextDataProp ) => {
					this.setIntoDataProp( propName, {
						[ this.getPendingKey( method ) ]: false,
						...nextDataProp,
					} );
				} );
		}

		applyMapping( props, previousDataProps = {} ) {
			const mapping = mapPropsToData( props, this.routeHelpers );
			const nextDataProps = reduce( mapping, ( result, path, propName ) => {
				// Skip if mapping already assigned into state data props
				// Example: Component updates with one new prop and other
				// previously existing; previously existing should not be
				// clobbered or re-trigger fetch
				const dataProp = previousDataProps[ propName ];
				if ( dataProp && dataProp.path === path ) {
					result[ propName ] = dataProp;
					return result;
				}

				result[ propName ] = {};

				const route = getRoute( this.schema, path );
				if ( ! route ) {
					return result;
				}

				route.methods.forEach( ( method ) => {
					// Add request initiator into data props
					const requestKey = this.getRequestKey( method );
					result[ propName ][ requestKey ] = this.request.bind(
						this,
						propName,
						method,
						path
					);

					// Initialize pending flags as explicitly false
					const pendingKey = this.getPendingKey( method );
					result[ propName ][ pendingKey ] = false;

					// If cached data already exists, populate in result
					const cachedResponse = getCachedResponse( { path, method } );
					if ( cachedResponse ) {
						const dataKey = this.getResponseDataKey( method );
						result[ propName ][ dataKey ] = cachedResponse.body;
					}

					// Track path for future map skipping
					result[ propName ].path = path;
				} );

				return result;
			}, {} );

			return nextDataProps;
		}

		render() {
			return (
				<WrappedComponent
					{ ...this.props }
					{ ...this.state.dataProps } />
			);
		}
	}

	APIDataComponent.contextTypes = {
		getAPISchema: noop,
		getAPIPostTypeRestBaseMapping: noop,
		getAPITaxonomyRestBaseMapping: noop,
	};

	return APIDataComponent;
}, 'withAPIData' );
