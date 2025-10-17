import {
	fetchDomainWhois,
	validateDomainWhois,
	updateDomainWhois,
	type DomainContactDetails,
	type ContactValidationRequestContactInformation,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const domainWhoisQuery = ( domainName: string ) =>
	queryOptions( {
		queryKey: [ 'domains', domainName, 'whois' ],
		queryFn: () => fetchDomainWhois( domainName ),
	} );

export const domainWhoisValidateMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( domainContactDetails: DomainContactDetails ) => {
			const contactInformation = mapRecordKeysRecursively(
				domainContactDetails,
				camelToSnakeCase
			) as ContactValidationRequestContactInformation;
			return validateDomainWhois( domainName, contactInformation );
		},
	} );

export const domainWhoisMutation = ( domainName: string ) =>
	mutationOptions( {
		mutationFn: ( {
			domainContactDetails,
			transferLock,
		}: {
			domainContactDetails: DomainContactDetails;
			transferLock: boolean;
		} ) => updateDomainWhois( domainName, domainContactDetails, transferLock ),
		onSuccess: () => queryClient.invalidateQueries( domainWhoisQuery( domainName ) ),
	} );

function isRecord( value: unknown ): value is Record< string, unknown > {
	const valueAsObject = value as Record< string, unknown > | undefined;
	return valueAsObject?.constructor === Object;
}

/**
 * Convert a camelCaseWord to a snake_case_word.
 *
 * This is designed to work nearly identically to the lodash `snakeCase`
 * function. Notably:
 *
 * - Leading and trailing spaces are removed.
 * - Leading and trailing underscores are removed.
 * - Spaces are collapsed into a single underscore.
 * - Numbers are considered to be capital letters of a different type.
 * - Multiple adjacent captial letters of the same type are considered part of the same word.
 */
function camelToSnakeCase( camelCaseString: string ): string {
	return (
		camelCaseString
			// collapse all spaces into an underscore
			.replace( /\s+/g, '_' )
			// wrap underscores around capitalized words
			.replace( /[A-Z][a-z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around capital letter groups
			.replace( /[A-Z]+/g, ( letter: string ): string => `_${ letter.toLowerCase() }_` )
			// wrap underscores around number groups
			.replace( /[0-9]+/g, ( letter: string ): string => `_${ letter }_` )
			// remove duplicate underscores
			.replace( /_+/g, '_' )
			// strip leading/trailing underscores
			.replace( /(^_)|(_$)/g, '' )
	);
}

/**
 * Transform the keys of an record object recursively
 *
 * This transforms an object, modifying all of its keys using a tranform
 * function. If any of the values of the object are also record objects, their
 * keys will also be transformed, and so on.
 *
 * Note that even though Arrays are objects, this will not modify arrays that
 * it finds, so any objects contained within arrays that are properties of the
 * original object will be returned unchanged.
 */
function mapRecordKeysRecursively(
	record: Record< string, unknown >,
	transform: ( original: string ) => string
): Record< string, unknown > {
	return Object.keys( record ).reduce( function ( mapped, key ) {
		let value = record[ key ];
		if ( isRecord( value ) ) {
			value = mapRecordKeysRecursively( value, transform );
		}
		return {
			...mapped,
			[ transform( key ) ]: value,
		};
	}, {} );
}
