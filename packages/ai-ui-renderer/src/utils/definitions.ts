import { createComponentImplementation } from '@a2ui/react';
import { createElement, Suspense } from '@wordpress/element';
import { useInteractiveUiHostProps, useInteractiveUiSurface } from '../contexts/surface';
import type { ReactComponentImplementation } from '@a2ui/react';
import type { ComponentApi, FunctionImplementation } from '@a2ui/web_core';
import type { ComponentType } from 'react';

/**
 * An A2UI v1.0 catalog document (https://a2ui.org/specification/v1_0/catalog_definition.json): the
 * catalog's components and functions as JSON Schema, which the server reads too.
 */
export interface InteractiveUiCatalogDocument {
	/** A versioned ID, such as `urn:automattic:example:interactive-ui:v1`. */
	catalogId: string;
	/** A short name for people. */
	title?: string;
	/** What the catalog offers, for people. */
	description?: string;
	/** How the agent should use the catalog. */
	instructions?: string;
	/** Each component's props, by name, such as `ExampleCard`. */
	components?: Record< string, object >;
	/** Each function's call, by name, such as `exampleOpenItem`. */
	functions?: Record< string, object >;
}

/** A host's or provider's own catalog: its document and the code that implements it. */
export interface InteractiveUiCatalogDefinition {
	catalog: InteractiveUiCatalogDocument;

	/**
	 * Whether the agent can compose surfaces with the catalog. Set it to `false` for a catalog only
	 * abilities build surfaces with: the host still lists its ID, but not its document. Defaults to
	 * `true`.
	 */
	agentComposable?: boolean;

	/**
	 * Each of the document's components. They get bound values resolved, a `set<Prop>` setter for
	 * each, actions as functions, their `surfaceId`, `disabled` and `isShowingErrors` state, the
	 * host's props, and, when they declare `checks`, `isValid` and `validationErrors`. A `lazy()`
	 * one renders nothing while it loads.
	 */
	// A catalog holds components with different props types.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	components?: Record< string, ComponentType< any > >;

	/**
	 * Each of the document's functions, which may be async. Their arguments come from the agent, so
	 * treat them as untrusted. They run only from a click unless the document sets
	 * `requiresUserActivation: false`.
	 */
	functions?: Record< string, ( args: Record< string, unknown > ) => unknown >;
}

export function toComponentImplementation(
	{ name, schema, allowedParents, allowedChildren }: ComponentApi,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: ComponentType< any >
): ReactComponentImplementation {
	function DefinitionComponent( { props }: { props: Record< string, unknown > } ) {
		const { surfaceId, disabled, isShowingErrors } = useInteractiveUiSurface();
		const hostProps = useInteractiveUiHostProps();

		// Like the basic components, it gets its surface's disabled and error state. The surface's
		// own state and the host's props win, so a surface can't override them. Its own boundary
		// keeps a `lazy()` one from holding back the rest of the page while it loads.
		return createElement(
			Suspense,
			{ fallback: null },
			createElement( component, {
				...props,
				surfaceId,
				disabled,
				isShowingErrors,
				...hostProps,
			} )
		);
	}

	return {
		...createComponentImplementation( { name, schema }, DefinitionComponent ),
		allowedParents,
		allowedChildren,
	};
}

export function toFunctionImplementation(
	api: Omit< FunctionImplementation, 'execute' >,
	execute: ( args: Record< string, unknown > ) => unknown
): FunctionImplementation {
	return {
		...api,
		// Values can call functions too, so one runs only from a click unless its document opts out.
		requiresUserActivation: api.requiresUserActivation ?? true,
		execute: ( args, context ) => {
			const result = execute( args );

			// A2UI reports only errors thrown right away, so report an async function's failure too,
			// and settle the promise A2UI awaits on a click.
			if ( result instanceof Promise ) {
				return result.catch( ( error: unknown ) =>
					context.surface?.dispatchError( {
						code: 'EXPRESSION_ERROR',
						message: error instanceof Error ? error.message : String( error ),
						expression: api.name,
					} )
				);
			}

			return result;
		},
	};
}
