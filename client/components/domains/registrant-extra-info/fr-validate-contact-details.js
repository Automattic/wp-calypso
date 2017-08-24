/**
 * External dependencies
 */
import { get, reduce, set } from 'lodash';
import validatorFactory from 'is-my-json-valid';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import validationSchema from './fr-schema';

const validate = validatorFactory( validationSchema, { greedy: true } );
const debug = debugFactory( 'calypso:components:domains:registrant-extra-info:validation' );

/*
 * @returns errors by field, like: { 'extra.field: name, errors: [ string ] }
 */
export default function validateContactDetails( contactDetails ) {
	// Populate validate.errors
	validate( contactDetails );
	validate.errors && debug( validate.errors );

	return reduce(
		validate.errors,
		( acc, { field, message } ) => {
			// Drop 'data.' prefix
			const path = String( field ).split( '.' ).slice( 1 );

			return set(
				acc,
				path,
				[ ...get( acc, path, [] ), message ]
			);
		},
		{}
	);
}
