import { CheckableSchema, DataBindingSchema, markChildRef } from '@a2ui/web_core/v1_0';
import { z } from 'zod';

// Values take a literal or a data binding, never a function call: only clicks and checks call
// functions.
export const StringValueSchema = z.union( [ z.string(), DataBindingSchema ] );
export const NumberValueSchema = z.union( [ z.number(), DataBindingSchema ] );
export const BooleanValueSchema = z.union( [ z.boolean(), DataBindingSchema ] );

/** A layout's children, as the IDs of other components. */
export const ChildIdsSchema = markChildRef( z.array( z.string().min( 1 ) ), 'child-list' );

/**
 * A2UI's `checks`, unchanged: their `CheckRule` tag is what makes A2UI evaluate them into the
 * component's `isValid` and `validationErrors`.
 */
export const ChecksSchema = CheckableSchema.shape.checks;
