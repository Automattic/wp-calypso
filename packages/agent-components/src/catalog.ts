import { bindingPath } from './bindings';
import { identifier, keys, limits, record, string, text } from './validation-utils';
import type {
	ComponentNode,
	ChoicePickerComponent,
	ColumnComponent,
	TextComponent,
	TextFieldComponent,
} from './types';

export interface BindingRequirement {
	path: string;
	kind: 'scalar' | 'string' | 'single' | 'multiple';
	editable: boolean;
	disabled: boolean;
	options?: readonly string[];
}

interface ComponentDefinition {
	validate: ( value: unknown ) => boolean;
	children: ( component: ComponentNode ) => readonly string[];
	bindings: ( component: ComponentNode ) => readonly BindingRequirement[];
}

function booleanProperties( value: Record< string, unknown >, properties: string[] ) {
	return properties.every(
		( key ) => ! Object.hasOwn( value, key ) || typeof value[ key ] === 'boolean'
	);
}

const layout: ComponentDefinition = {
	validate: ( value ) =>
		record( value ) &&
		keys( value, [ 'id', 'type', 'children' ] ) &&
		Array.isArray( value.children ) &&
		value.children.length <= limits.components &&
		Array.from( value.children ).every( ( child ) => identifier( child ) ),
	children: ( component ) => ( component as ColumnComponent ).children,
	bindings: () => [],
};

export const componentDefinitions: Readonly< Record< string, ComponentDefinition > > = {
	Column: layout,
	Row: layout,
	Text: {
		validate: ( value ) => {
			if (
				! record( value ) ||
				! keys( value, [ 'id', 'type', 'content', 'variant' ], [ 'tone' ] ) ||
				! record( value.content )
			) {
				return false;
			}
			if (
				! ( keys( value.content, [ 'text' ] ) && string( value.content.text ) ) &&
				! ( keys( value.content, [ 'path' ] ) && bindingPath( value.content.path ) )
			) {
				return false;
			}
			return value.variant === 'status'
				? typeof value.tone === 'string' &&
						[ 'neutral', 'success', 'warning', 'error' ].includes( value.tone )
				: typeof value.variant === 'string' &&
						[ 'heading', 'body', 'caption' ].includes( value.variant ) &&
						! Object.hasOwn( value, 'tone' );
		},
		children: () => [],
		bindings: ( component ) => {
			const content = ( component as TextComponent ).content;
			return 'path' in content
				? [ { path: content.path, kind: 'scalar', editable: false, disabled: false } ]
				: [];
		},
	},
	Button: {
		validate: ( value ) =>
			record( value ) &&
			keys( value, [ 'id', 'type', 'label', 'action', 'variant' ], [ 'disabled', 'loading' ] ) &&
			text( value.label, limits.label ) &&
			identifier( value.action ) &&
			typeof value.variant === 'string' &&
			[ 'primary', 'secondary', 'link' ].includes( value.variant ) &&
			booleanProperties( value, [ 'disabled', 'loading' ] ),
		children: () => [],
		bindings: () => [],
	},
	TextField: {
		validate: ( value ) =>
			record( value ) &&
			keys(
				value,
				[ 'id', 'type', 'label', 'path', 'inputMode' ],
				[ 'placeholder', 'required', 'disabled', 'validationMessage' ]
			) &&
			text( value.label, limits.label ) &&
			bindingPath( value.path ) &&
			typeof value.inputMode === 'string' &&
			[ 'shortText', 'longText' ].includes( value.inputMode ) &&
			booleanProperties( value, [ 'required', 'disabled' ] ) &&
			[ 'placeholder', 'validationMessage' ].every(
				( key ) => ! Object.hasOwn( value, key ) || string( value[ key ] )
			),
		children: () => [],
		bindings: ( component ) => {
			const field = component as TextFieldComponent;
			return [
				{ path: field.path, kind: 'string', editable: true, disabled: field.disabled === true },
			];
		},
	},
	ChoicePicker: {
		validate: ( value ) => {
			if (
				! record( value ) ||
				! keys( value, [ 'id', 'type', 'label', 'path', 'mode', 'options' ], [ 'disabled' ] ) ||
				! text( value.label, limits.label ) ||
				! bindingPath( value.path ) ||
				( value.mode !== 'single' && value.mode !== 'multiple' ) ||
				! booleanProperties( value, [ 'disabled' ] ) ||
				! Array.isArray( value.options ) ||
				value.options.length === 0 ||
				value.options.length > limits.options
			) {
				return false;
			}
			const seen = new Set< string >();
			return Array.from( value.options ).every( ( option ) => {
				if (
					! record( option ) ||
					! keys( option, [ 'value', 'label' ] ) ||
					! text( option.value ) ||
					! text( option.label, limits.label ) ||
					seen.has( option.value )
				) {
					return false;
				}
				seen.add( option.value );
				return true;
			} );
		},
		children: () => [],
		bindings: ( component ) => {
			const field = component as ChoicePickerComponent;
			return [
				{
					path: field.path,
					kind: field.mode,
					editable: true,
					disabled: field.disabled === true,
					options: field.options.map( ( option ) => option.value ),
				},
			];
		},
	},
};
