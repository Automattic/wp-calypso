/**
 * Internal dependencies
 */
import type { FieldType, FieldTypeDefinition } from '../types';
import { default as base } from './base';
import { default as email } from './email';
import { default as integer } from './integer';
import { default as text } from './text';
import { default as datetime } from './datetime';
import { default as boolean } from './boolean';
import { default as media } from './media';

/**
 *
 * @param {FieldType} type The field type definition to get.
 *
 * @return A field type definition.
 */
export default function getFieldTypeDefinition< Item >(
	type?: FieldType
): FieldTypeDefinition< Item > {
	if ( 'email' === type ) {
		return email;
	}

	if ( 'integer' === type ) {
		return integer;
	}

	if ( 'text' === type ) {
		return text;
	}

	if ( 'datetime' === type ) {
		return datetime;
	}

	if ( 'boolean' === type ) {
		return boolean;
	}

	if ( 'media' === type ) {
		return media;
	}

	// This is a fallback for fields that don't provide a type.
	// It can be removed when the field.type is mandatory.
	return base;
}
