/**
 * External Dependencies
 */

import React, { Component } from 'react';

/**
 * Internal Dependencies
 */

import Spinner from 'components/spinner';
import Card from 'components/card';
import DocService from 'devdocs/service';
import Table from './table';
import { slugToCamelCase } from 'devdocs/docs-example/util';

class PropsEditor extends Component {
	constructor( props ) {
		super( props );
		this.includePath = null;
	}

	componentWillMount() {
		this.requestPropsFor( this.props.component );
	}

	componentWillReceiveProps() {
		this.requestPropsFor( this.props.component );
	}

	/**
	 * Given a propType from the code, convert it to an easily digestible array of propTypes
	 * @param {Object} props The object of props
	 * @returns {Array} An array of props
	 */
	reducePropTypes = ( props ) => {
		return Object.keys( props.props ).reduce( ( previous, current ) => {
			const prop = props.props[ current ];

			// if this is an arrayOf, or another "holding" type, this will be the type that array holds.
			// Using an IIFE so that it's easier to read
			const holds = ( () => {
				if ( ! prop.type ) {
					return null;
				}
				switch ( prop.type.name ) {
					case 'arrayOf':
					default:
						if ( ! prop.type.value ) {
							return 'unknown';
						}
						return prop.type.value.name;
				}
			} )();

			// Allows example wrappers to override default values
			// Using an IIFE so that it's easier to read...
			const overrodeDefaultValue = ( () => {
				if ( prop.type && prop.type.name === 'func' ) {
					return ( ...args ) => {
						console.log( `Function ${ prop.name } called with:`, args ); // eslint-disable-line no-console
					};
				}

				if ( prop.defaultValue &&
					prop.defaultValue.value !== undefined ) {
					return prop.defaultValue.value;
				}

				if ( props.example &&
					props.example.props &&
					props.example.props[ current ] !== undefined ) {
					const newVal = props.example.props[ current ]; // doing this for easy grok
					if ( newVal.defaultValue &&
						newVal.defaultValue.value !== undefined ) {
						return newVal.defaultValue.value;
					}
				}

				return '\'undefined\'';
			} )();

			previous.push( {
				/**
				 * Whether or not the defaultValue is a computed property
				 */
				computed: prop.defaultValue ? prop.defaultValue.computed : false,

				/**
				 * The description defined by jsdoc comments like these
				 */
				description: prop.description,

				/**
				 * If this prop is a container, the type the container holds
				 */
				holds,

				/**
				 * The name of the prop
				 */
				name: current,

				/**
				 * Whether or not the prop is required to render
				 */
				required: prop.required,

				/**
				 * The type of the prop, unknown if its missing from propTypes
				 */
				type: prop.type ? prop.type.name : 'unknown',

				/**
				 * The default value defined by the component
				 */
				defaultValue: prop.defaultValue && prop.defaultValue.value ? prop.defaultValue.value : '\'undefined\'',

				/**
				 * The current value of the rendered component
				 */
				value: overrodeDefaultValue,
			} );

			return previous;
		}, [] );
	};

	/**
	 * Get the props for a given component and update the state
	 * @param {string} component The component to search for in slug form
	 */
	requestPropsFor = ( component ) => {
		this.setState( { loading: true } );

		DocService.props( component, ( error, sourceProps ) => {
			if ( error ) {
				this.setState( {
					loading: false,
					error
				} );
				return;
			}

			const includePath = sourceProps.includePath;
			const supported = sourceProps.example.props && sourceProps.example.props.isShowingOff;

			const loading = false,
				props = this.reducePropTypes( sourceProps );

			const computedProps = {
				isShowingOff: true
			};

			props.forEach( ( prop ) => {
				computedProps[ prop.name ] = this.parse( prop.type, prop.value, prop.name );
			} );

			this.setState( {
				loading,
				props,
				computedProps,
				includePath,
				supported
			} );
		} );
	};

	/**
	 * Renders the example wrapper
	 * @returns {Element} The example wrapper or an error message
	 */
	renderExample = () => {
		if ( ! this.state.renderError ) {
			return React.cloneElement( this.props.example, this.state.computedProps );
		}

		return ( <div>You've passed an invalid prop. Fix it to re-render.</div> );
	};

	/**
	 * Creates an error boundary, currently unstable in React, but prevents errors from bubbling up the render tree
	 * and breaking the app.
	 * @see https://github.com/facebook/react/issues/2461
	 */
	unstable_handleError() {
		this.setState( {
			renderError: true
		} );
	}

	/**
	 * Given a prop type, name and value, parse the new value and update the render tree with new props
	 * @param {string} type The type of the prop
	 * @param {string} name The name of the prop to update
	 * @param {string} value The new value of the prop
	 */
	updateProp = ( type, name, value ) => {
		// if the value is an event, then use the event's target's value
		if ( value.target ) {
			value = value.target.value;
		}

		this.state.computedProps[ name ] = this.parse( type, value );

		this.setState( {
			computedProps: { ...this.state.computedProps },
			renderError: false
		} );
	};

	/**
	 * Parse a value, based on the expected type
	 * @param {string} type The type of the value
	 * @param {string} value The value to parse
	 * @param {string} name An optional name of the thing being parsed
	 * @returns {*} The parsed value
	 */
	parse = ( type, value, name = '' ) => {
		if ( value === '\'undefined\'' ) {
			value = undefined;
		}

		switch ( type ) {
			case 'number':
				if ( value === undefined ) {
					return 0;
				}
				return parseInt( value.replace( /'/g, '' ) );
			case 'string':
				if ( value === undefined ) {
					return '';
				}
				return value.replace( /'/g, '' );
			case 'bool':
				return value === 'true';
			case 'arrayOf':
				if ( value !== undefined && value.indexOf( '[' ) === 0 && value.indexOf( ']' ) === value.length - 1 ) {
					return JSON.parse( value );
				}
				return value;
			case 'object':
				if ( value !== undefined && value.indexOf( '{' ) === 0 && value.indexOf( '}' ) === value.length - 1 ) {
					return JSON.parse( value );
				}
				return value;
			case 'func':
				return ( ...args ) => {
					console.log( `Function( ${ name } ) called with`, args ); //eslint-disable-line no-console
				};
			default:
				return value;
		}
	};

	/**
	 * Renders a table
	 * @returns {Element} The table to render
	 */
	renderProps = () => {
		return (
			<Table props={ this.state.props } onUpdate={ this.updateProp } />
		);
	};

	render() {
		if ( this.state.loading ) {
			return (
				<div>
					<Card>
						<div>
							Reading the code so you don't have to...
						</div>
						<Spinner size={ 50 } />
					</Card>
				</div>
			);
		}

		if ( this.state.error ) {
			return this.renderExample();
		}

		return (
			<div>
				{ this.renderExample() }
				{
					this.state.supported ? null : <p>
						This component does not yet support editing the props,
						see (todo: insert some doc link here) to make it so you can edit the props.
					</p>
				}
				<p>
					Require this component: &nbsp;
					<code>
						import { slugToCamelCase( this.props.component ) } from { this.state.includePath }
					</code>
				</p>
				{ this.renderProps() }
			</div>
		);
	}
}

export default PropsEditor;
