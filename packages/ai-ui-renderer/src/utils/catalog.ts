import { Catalog, SpecVersion } from '@a2ui/web_core';
import {
	BASIC_FUNCTIONS as A2UI_BASIC_FUNCTIONS,
	V10_VALIDATION_FUNCTION_IMPLEMENTATIONS,
} from '@a2ui/web_core/v1_0';
import { z } from 'zod';
import { assertInteractiveUiCatalogDefinition, BASIC_CATALOG_ID } from '../capabilities';
import { AudioPlayer } from '../components/audio-player';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { CheckBox } from '../components/check-box';
import { ChoicePicker } from '../components/choice-picker';
import { Column } from '../components/column';
import { DateTimeInput } from '../components/date-time-input';
import { Divider } from '../components/divider';
import { Icon } from '../components/icon';
import { Image } from '../components/image';
import { List } from '../components/list';
import { Modal } from '../components/modal';
import { Row } from '../components/row';
import { Slider } from '../components/slider';
import { Tabs } from '../components/tabs';
import { Text } from '../components/text';
import { TextField } from '../components/text-field';
import { Video } from '../components/video';
import { toComponentImplementation, toFunctionImplementation } from './definitions';
import type { InteractiveUiCatalogDefinition } from './definitions';
import type { ReactComponentImplementation } from '@a2ui/react';
import type { FunctionImplementation } from '@a2ui/web_core';

// The basic components define their own schemas: values take a literal or a data binding, never a
// function call, and only the variants they render.
const BASIC_COMPONENTS: readonly ReactComponentImplementation[] = [
	Text,
	TextField,
	Button,
	Column,
	Image,
	Icon,
	Row,
	List,
	Card,
	Divider,
	CheckBox,
	ChoicePicker,
	DateTimeInput,
	Video,
	AudioPlayer,
	Tabs,
	Modal,
	Slider,
];

const VALIDATION_FUNCTION_NAMES = new Set(
	V10_VALIDATION_FUNCTION_IMPLEMENTATIONS.map( ( { name } ) => name )
);

// A2UI's validation functions return English messages, which would replace a check's own
// `message`, so these return only whether the value is valid; a check without a `message` shows
// A2UI's generic one. They also take a missing `value`, such as an unset path, as empty, where
// A2UI's argument schema would reject the call.
const BASIC_FUNCTIONS: readonly FunctionImplementation[] = A2UI_BASIC_FUNCTIONS.map(
	( implementation ) => {
		const { name, schema } = implementation;

		if ( ! VALIDATION_FUNCTION_NAMES.has( name ) || ! ( schema instanceof z.ZodObject ) ) {
			return implementation;
		}

		return {
			...implementation,
			schema: schema.extend( { value: schema.shape.value.optional() } ),
			execute: ( ...args ) => ( {
				valid: ( implementation.execute( ...args ) as { valid: boolean } ).valid,
			} ),
		};
	}
);

export type InteractiveUiCatalog = Catalog< ReactComponentImplementation >;

/**
 * Builds A2UI's Basic catalog, or a definition's catalog: the basic components and functions plus
 * its own, which replace basic ones of the same name. Throws when the definition fails
 * `assertInteractiveUiCatalogDefinition()`, or its document isn't a valid A2UI catalog.
 */
export function createInteractiveUiCatalog(
	definition?: InteractiveUiCatalogDefinition
): InteractiveUiCatalog {
	if ( ! definition ) {
		return new Catalog(
			BASIC_CATALOG_ID,
			SpecVersion.V1_0,
			[ ...BASIC_COMPONENTS ],
			[ ...BASIC_FUNCTIONS ]
		);
	}

	assertInteractiveUiCatalogDefinition( definition );

	const { catalog, components = {}, functions = {} } = definition;
	const apis = Catalog.fromJson( catalog, SpecVersion.V1_0 );

	return new Catalog(
		catalog.catalogId,
		SpecVersion.V1_0,
		[
			...BASIC_COMPONENTS,
			...[ ...apis.components.values() ].map( ( api ) =>
				toComponentImplementation( api, components[ api.name ] )
			),
		],
		[
			...BASIC_FUNCTIONS,
			...[ ...apis.functions.values() ].map( ( api ) =>
				toFunctionImplementation( api, functions[ api.name ] )
			),
		],
		{ instructions: catalog.instructions }
	);
}
