import { Catalog, SpecVersion } from '@a2ui/web_core';
import { BASIC_FUNCTIONS } from '@a2ui/web_core/v1_0';
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
import type {
	AnyInteractiveUiComponentDefinition,
	InteractiveUiFunctionDefinition,
} from './definitions';
import type { ReactComponentImplementation } from '@a2ui/react';

/** The ID of A2UI's Basic catalog, which the basic components implement. */
export const BASIC_CATALOG_ID = 'https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json';

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

export interface InteractiveUiCatalogOptions {
	/** The catalog's ID. Give a catalog with the host's own components its own versioned ID. */
	id?: string;
	/** The host's own components, added to the basic ones. */
	components?: AnyInteractiveUiComponentDefinition[];
	/** The host's own functions, added to A2UI's built-in ones. */
	functions?: InteractiveUiFunctionDefinition[];
}

export type InteractiveUiCatalog = Catalog< ReactComponentImplementation >;

function assertUniqueNames( items: { name: string }[], kind: 'component' | 'function' ) {
	const names = new Set< string >();

	for ( const { name } of items ) {
		if ( names.has( name ) ) {
			throw new Error( `Duplicate interactive UI ${ kind } name: ${ name }` );
		}

		names.add( name );
	}
}

/**
 * Builds an A2UI v1.0 catalog from the basic components and A2UI's built-in functions plus the
 * host's own, under the Basic catalog's ID unless given another. Throws on a duplicate name.
 */
export function createInteractiveUiCatalog( {
	id = BASIC_CATALOG_ID,
	components = [],
	functions = [],
}: InteractiveUiCatalogOptions = {} ): InteractiveUiCatalog {
	const allComponents = [ ...BASIC_COMPONENTS, ...components.map( toComponentImplementation ) ];
	const allFunctions = [ ...BASIC_FUNCTIONS, ...functions.map( toFunctionImplementation ) ];

	assertUniqueNames( allComponents, 'component' );
	assertUniqueNames( allFunctions, 'function' );

	return new Catalog( id, SpecVersion.V1_0, allComponents, allFunctions );
}
