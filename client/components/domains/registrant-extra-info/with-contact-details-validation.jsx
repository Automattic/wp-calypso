/**
 * Extrenal dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import validatorFactory from 'is-my-json-valid';
import { castArray, get, isEmpty, map, reduce, replace, set } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:domains:with-contact-details-validation' );

/**
 * Internal dependencies
 */
import getValidationSchemas from 'state/selectors/get-validation-schemas';

export function disableSubmitButton( children ) {
	if ( isEmpty( children ) ) {
		return children;
	}

	return map( castArray( children ), ( child, index ) =>
		React.cloneElement( child, {
			disabled: !! child.props.className.match( /submit-button/ ) || child.props.disabled,
			key: index,
		} )
	);
}

export function interpretIMJVError( error, schema ) {
	let explicitPath, errorCode;

	if ( schema ) {
		// Search up the schema for an explicit errorField & message
		const path = [ ...castArray( error.schemaPath ) ];

		do {
			const node = get( schema, path, {} );
			errorCode = errorCode || node.errorCode;
			explicitPath = explicitPath || node.errorField;
		} while ( path.pop() && ! ( explicitPath && errorCode ) );
	}

	// use field from error
	const inferredPath = replace( error.field, /^data\./, '' );

	return {
		errorCode: errorCode || error.message,
		path: explicitPath || inferredPath,
	};
}

/*
 * @returns errors by field, like: { 'extra.field: name, errors: [ string ] }
 */
export function formatIMJVErrors( errors, schema ) {
	return reduce(
		errors,
		( accumulatedErrors, error ) => {
			// scan for errorField and errorCode at or above the failed rule
			const details = interpretIMJVError( error, schema );

			const { path, errorCode } = details;

			// TODO: get localize user facing strings
			const message = errorCode;

			const previousErrorsForField = get( accumulatedErrors, path, [] );

			return set( accumulatedErrors, path, [ ...previousErrorsForField, message ] );
		},
		{}
	);
}

export default function WithContactDetailsValidation( tld, WrappedComponent ) {
	const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || '';

	class ComponentWithValidation extends Component {
		static propTypes = {
			validationSchema: PropTypes.object.isRequired,
		};

		displayName = 'WithContactDetailsValidation(' + tld + ', ' + wrappedComponentName + ')';

		validate = () => {};

		componentWillMount() {
			this.compileValidator();
		}

		componentWillReceiveProps( nextProps ) {
			if ( nextProps.validationSchema !== this.props.validationSchema ) {
				this.compileValidator();
			}
		}

		compileValidator() {
			// The schema object we compile is available at this.validate.toJSON()
			// but we already check it's different in componentWillReceiveProps
			debug( `compiling validation schema for ${ tld }`, this.props.validationSchema );
			this.validate = validatorFactory( this.props.validationSchema, {
				greedy: true,
				verbose: true,
			} );
		}

		validateContactDetails() {
			if ( typeof this.validate !== 'function' ) {
				return {};
			}

			// This is pretty fast, but is a candidate for memoization
			debug( 'validating contactDetails' );
			let isValid = false;
			try {
				isValid = this.validate( this.props.contactDetails );
			} catch ( error ) {
				// An exception here usually indicates a problem with the schema
				// but could result from malformed contactDetails.
				// We console.error here so it gets logged and we can track it.
				// eslint-disable-next-line no-console
				console.error( 'Error thrown during validation:', {
					error,
					tld: tld,
					contactDetails: this.props.contactDetails,
				} );
				return { '': [ 'There was an unexpected error validating these details' ] };
			}

			if ( isValid ) {
				debug( 'data is valid' );
				return {};
			}

			// TODO: error codes => localized strings
			const result = formatIMJVErrors( this.validate.errors, this.props.validationSchema );

			return result;
		}

		render() {
			return (
				<WrappedComponent { ...this.props } validationErrors={ this.validateContactDetails() } />
			);
		}
	}

	return connect(
		state => ( {
			validationSchema: get( getValidationSchemas( state ), tld, { not: {} } ),
		} ),
		null
	)( ComponentWithValidation );
}
