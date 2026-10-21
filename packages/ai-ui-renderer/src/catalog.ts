import { basicCatalog } from '@a2ui/react/v0_9';
import { BASIC_FUNCTIONS, Catalog } from '@a2ui/web_core/v0_9';
import { AudioPlayer } from './audio-player';
import Button from './button';
import Card from './card';
import CheckBox from './check-box';
import ChoicePicker from './choice-picker';
import Column from './column';
import DateTimeInput from './date-time-input';
import { toComponentImplementation, toFunctionImplementation } from './definitions';
import Divider from './divider';
import Icon from './icon';
import Image from './image';
import List from './list';
import { Modal } from './modal';
import Row from './row';
import { Slider } from './slider';
import { Tabs } from './tabs';
import Text from './text';
import TextField from './text-field';
import { Video } from './video';
import type {
	AnyInteractiveUiComponentDefinition,
	InteractiveUiFunctionDefinition,
} from './definitions';
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';

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
 * Builds a catalog from the basic components and A2UI's built-in functions plus the host's own,
 * under the Basic catalog's ID unless given another. Throws on a duplicate name.
 */
export function createInteractiveUiCatalog( {
	id = basicCatalog.id,
	components = [],
	functions = [],
}: InteractiveUiCatalogOptions = {} ): InteractiveUiCatalog {
	const allComponents = [ ...BASIC_COMPONENTS, ...components.map( toComponentImplementation ) ];
	const allFunctions = [ ...BASIC_FUNCTIONS, ...functions.map( toFunctionImplementation ) ];

	assertUniqueNames( allComponents, 'component' );
	assertUniqueNames( allFunctions, 'function' );

	return new Catalog(
		id,
		basicCatalog.protocolVersion,
		allComponents,
		allFunctions,
		basicCatalog.themeSchema
	);
}
