import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ActionSchema, DataBindingSchema } from '@a2ui/web_core/v0_9';
import { createElement } from '@wordpress/element';
import { z } from 'zod';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { FunctionImplementation } from '@a2ui/web_core/v0_9';
import type { ComponentType } from 'react';

// Definitions from other bundles build their schemas with these, not their own `zod` and A2UI.
// Values take a literal or a data binding, never a function call: functions run only on a click.
const SCHEMA_KIT = {
	z,
	ActionSchema,
	DataBindingSchema,
	StringValueSchema: z.union( [ z.string(), DataBindingSchema ] ),
	NumberValueSchema: z.union( [ z.number(), DataBindingSchema ] ),
	BooleanValueSchema: z.union( [ z.boolean(), DataBindingSchema ] ),
};

/** What a definition's `schema` builds with: the renderer's `zod` and A2UI's shared schemas. */
type InteractiveUiSchemaKit = typeof SCHEMA_KIT;

/** A component that a host or provider adds to a catalog, with no dependency on A2UI. */
export interface InteractiveUiComponentDefinition< Props = Record< string, unknown > > {
	/** Prefixed with its owner, such as `AgentsManagerColorPicker`. */
	name: string;
	/**
	 * Builds the props schema. The component gets bound values resolved, a `set<Prop>` setter for
	 * each, and actions as functions to call.
	 */
	schema: ( kit: InteractiveUiSchemaKit ) => z.AnyZodObject;
	component: ComponentType< Props >;
}

// A catalog holds definitions with different props types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInteractiveUiComponentDefinition = InteractiveUiComponentDefinition< any >;

/** A function that a host or provider adds to a catalog, called from an action such as a click. */
export interface InteractiveUiFunctionDefinition {
	/** Prefixed with its owner, such as `agentsManagerOpenHelpCenter`. */
	name: string;
	returnType: FunctionImplementation[ 'returnType' ];
	/** Builds the arguments schema. The arguments come from the agent, so treat them as untrusted. */
	schema: ( kit: InteractiveUiSchemaKit ) => z.ZodTypeAny;
	execute: ( args: Record< string, unknown > ) => unknown;
}

export function toComponentImplementation( {
	name,
	schema,
	component,
}: AnyInteractiveUiComponentDefinition ): ReactComponentImplementation {
	return createComponentImplementation( { name, schema: schema( SCHEMA_KIT ) }, ( { props } ) =>
		createElement( component, props )
	);
}

export function toFunctionImplementation( {
	name,
	returnType,
	schema,
	execute,
}: InteractiveUiFunctionDefinition ): FunctionImplementation {
	return {
		name,
		returnType,
		schema: schema( SCHEMA_KIT ),
		execute: ( args, context ) => {
			const result = execute( args );

			// A2UI reports only errors thrown right away, so report an async function's failure too.
			if ( result instanceof Promise ) {
				result.catch( ( error: unknown ) =>
					context.surface.dispatchError( {
						code: 'EXPRESSION_ERROR',
						message: error instanceof Error ? error.message : String( error ),
						expression: name,
					} )
				);
			}

			return result;
		},
	};
}
