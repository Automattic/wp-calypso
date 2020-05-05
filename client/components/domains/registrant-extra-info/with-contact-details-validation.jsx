/**
 * Extrenal dependencies
 *
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import validatorFactory from 'is-my-json-valid';
import { castArray, get, isEmpty, map, once, reduce, replace, update } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:domains:with-contact-details-validation' );

/**
 * Internal dependencies
 */
import getValidationSchemas from 'state/selectors/get-validation-schemas';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import warn from 'lib/warn';

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

/*
 * Lookup error in schema to produce { path, errorMessage, errorCode } format.
 *
 * e.g {
 *     path: "extra.uk.registrationNumber",
 *     errorMessage: "A registration number is required for this registrant type.",
 *     errorCode: "dotukRegistrantTypeRequiresRegistrationNumber",
 * }
 */
export function interpretIMJVError( error, schema ) {
	let explicitPath, errorCode, errorMessage;

	if ( schema ) {
		// Search up the schema for an explicit errorField & message
		const path = [ ...castArray( error.schemaPath ) ];

		// The errorCode is primary because messages are localized, so without
		// the code consumers couldn't do anything other than display errors.
		do {
			const node = get( schema, path, {} );
			if ( ! errorCode && node.errorCode ) {
				errorCode = node.errorCode;
				errorMessage = node.errorMessage;
			}
			explicitPath = explicitPath || node.errorField;
		} while ( path.pop() && ! ( explicitPath && errorCode ) );
	}

	// use field from error
	const path = explicitPath || replace( error.field, /^data\./, '' );

	return { errorMessage, errorCode, path };
}

/*
 * @returns errors by field, like: { extra: { tld: { fieldName: [ errors ] } } }
 */
export function formatIMJVErrors( errors, schema ) {
	return reduce(
		errors,
		( accumulatedErrors, rawError ) => {
			// Compare the error to the schema and try to find an appropriate
			// error message
			const error = interpretIMJVError( rawError, schema );

			return update( accumulatedErrors, error.path, ( errorsForField ) => [
				...( errorsForField || [] ),
				error,
			] );
		},
		{}
	);
}

export default function WithContactDetailsValidation( tld, WrappedComponent ) {
	const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || '';

	// If we see an exception, chances are we'll get an identical copy every
	// update, so just track the first one per form.
	const recordTracksEventOnce = once( recordTracksEvent );
	const bumpStatOnce = once( bumpStat );

	class ComponentWithValidation extends Component {
		static propTypes = {
			validationSchema: PropTypes.object.isRequired,
			bumpStat: PropTypes.func.isRequired,
			recordTracksEvent: PropTypes.func.isRequired,
		};

		displayName = 'WithContactDetailsValidation(' + tld + ', ' + wrappedComponentName + ')';

		UNSAFE_componentWillMount() {
			this.compileValidator();
		}

		UNSAFE_componentWillReceiveProps( nextProps ) {
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
			debug( 'validating contactDetails', this.props.contactDetails );
			let isValid = false;
			try {
				isValid = this.validate( this.props.contactDetails );
			} catch ( error ) {
				warn( 'Error thrown during validation:', {
					error,
					tld: tld,
					contactDetails: this.props.contactDetails,
				} );
				// An exception here usually indicates a problem with the schema
				// but could result from malformed contactDetails
				this.props.bumpStat( 'form_validation_schema_exceptions', tld );
				this.props.recordTracksEvent( 'calypso_domain_contact_validation_exception', {
					tld,
					contact_details: JSON.stringify( this.props.contactDetails ),
					error: error.message,
				} );

				// We should let the recipient know something went wrong, but
				// we can't attribute it to a specific field, so we'll use the
				// empty string as a placeholder of the right type that should
				// never appear as a field name.
				return { '': [ 'There was an unexpected error validating these details' ] };
			}

			if ( isValid ) {
				debug( 'data is valid' );
				return {};
			}

			// TODO: error codes => localized strings
			const result = formatIMJVErrors( this.validate.errors, this.props.validationSchema );
			debug( 'validation errors:', result );

			return result;
		}

		render() {
			return (
				<WrappedComponent { ...this.props } validationErrors={ this.validateContactDetails() } />
			);
		}
	}

	return connect(
		( state ) => ( {
			validationSchema: get( getValidationSchemas( state ), tld, { not: {} } ),
			recordTracksEvent,
		} ),
		{
			bumpStat: bumpStatOnce,
			recordTracksEvent: recordTracksEventOnce,
		}
	)( ComponentWithValidation );
}
