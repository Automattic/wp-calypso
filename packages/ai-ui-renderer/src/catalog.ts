import { basicCatalog } from '@a2ui/react/v0_9';
import { Catalog } from '@a2ui/web_core/v0_9';
import { AudioPlayer } from './audio-player';
import Button from './button';
import Card from './card';
import CheckBox from './check-box';
import ChoicePicker from './choice-picker';
import Column from './column';
import DateTimeInput from './date-time-input';
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
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import type { FunctionImplementation } from '@a2ui/web_core/v0_9';

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

interface InteractiveUiCatalogOptions {
	/** The host's own components, added to the basic ones. */
	components?: ReactComponentImplementation[];
	/** The host's functions, for actions, checks and dynamic values. */
	functions?: FunctionImplementation[];
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
 * Builds a host's catalog from the basic components plus its own. A surface renders with
 * one catalog, so everything a host renders goes in it, under the Basic catalog's ID that
 * the server's surfaces use. Throws on a duplicate name.
 */
export function createInteractiveUiCatalog( {
	components = [],
	functions = [],
}: InteractiveUiCatalogOptions = {} ): InteractiveUiCatalog {
	const allComponents = [ ...BASIC_COMPONENTS, ...components ];

	assertUniqueNames( allComponents, 'component' );
	assertUniqueNames( functions, 'function' );

	return new Catalog(
		basicCatalog.id,
		basicCatalog.protocolVersion,
		allComponents,
		functions,
		basicCatalog.themeSchema
	);
}
