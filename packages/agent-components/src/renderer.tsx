import {
	BaseControl,
	Button as GutenbergButton,
	CheckboxControl,
	SelectControl,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { Fragment, useId, useState } from '@wordpress/element';
import { readBinding, scalarText, writeBinding } from './bindings';
import { componentDefinitions } from './catalog';
import { linkifyText } from './text-links';
import type {
	ActionEvent,
	ButtonComponent,
	ChoicePickerComponent,
	ComponentNode,
	DataModel,
	JsonValue,
	Surface,
	TextComponent,
	TextFieldComponent,
} from './types';
import type { ReactNode } from 'react';

export function Column( { children }: { children: ReactNode } ) {
	return <div className="agent-components-column">{ children }</div>;
}

export function Row( { children }: { children: ReactNode } ) {
	return <div className="agent-components-row">{ children }</div>;
}

export function Text( { component, value }: { component: TextComponent; value?: JsonValue } ) {
	const className = `agent-components-text agent-components-text--${ component.variant }`;
	let content = '';
	if ( 'text' in component.content ) {
		content = component.content.text;
	} else if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	) {
		content = scalarText( value );
	}
	if ( component.variant === 'heading' ) {
		return <h3 className={ className }>{ linkifyText( content ) }</h3>;
	}
	return (
		<p className={ className } role={ component.variant === 'status' ? 'status' : undefined }>
			{ linkifyText( content ) }
		</p>
	);
}

export function TextField( {
	component,
	value,
	disabled,
	id,
	onChange,
}: {
	component: TextFieldComponent;
	value: string;
	disabled: boolean;
	id: string;
	onChange: ( value: string ) => void;
} ) {
	const props = {
		label: component.label,
		value,
		placeholder: component.placeholder,
		required: component.required,
		disabled: disabled || component.disabled,
		__nextHasNoMarginBottom: true,
		'aria-invalid': component.validationMessage ? true : undefined,
		'aria-describedby': component.validationMessage ? `${ id }-validation` : undefined,
		onChange,
	};
	return (
		<div className="agent-components-field">
			{ component.inputMode === 'longText' ? (
				<TextareaControl { ...props } />
			) : (
				<TextControl { ...props } id={ id } __next40pxDefaultSize />
			) }
			{ component.validationMessage && (
				<p id={ `${ id }-validation` } className="agent-components-validation" role="alert">
					{ component.validationMessage }
				</p>
			) }
		</div>
	);
}

export function ChoicePicker( {
	component,
	value,
	disabled,
	id,
	onChange,
}: {
	component: ChoicePickerComponent;
	value: string | string[];
	disabled: boolean;
	id: string;
	onChange: ( value: string | string[] ) => void;
} ) {
	if ( component.mode === 'multiple' ) {
		const selected = Array.isArray( value ) ? value : [];
		return (
			<fieldset className="agent-components-field agent-components-choices">
				<legend>
					<BaseControl.VisualLabel>{ component.label }</BaseControl.VisualLabel>
				</legend>
				{ component.options.map( ( option ) => (
					<CheckboxControl
						key={ option.value }
						label={ option.label }
						checked={ selected.includes( option.value ) }
						disabled={ disabled || component.disabled }
						__nextHasNoMarginBottom
						onChange={ ( checked ) =>
							onChange(
								component.options
									.filter( ( candidate ) =>
										candidate.value === option.value
											? checked
											: selected.includes( candidate.value )
									)
									.map( ( candidate ) => candidate.value )
							)
						}
					/>
				) ) }
			</fieldset>
		);
	}
	return (
		<div className="agent-components-field">
			<SelectControl
				id={ id }
				label={ component.label }
				value={ typeof value === 'string' ? value : '' }
				options={ component.options }
				disabled={ disabled || component.disabled }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				onChange={ onChange }
			/>
		</div>
	);
}

export function Button( {
	component,
	disabled,
	pending = false,
	onAction,
}: {
	component: ButtonComponent;
	disabled: boolean;
	pending?: boolean;
	onAction: ( action: string ) => void;
} ) {
	return (
		<GutenbergButton
			type="button"
			className="agent-components-button"
			variant={ component.variant }
			disabled={ disabled || pending || component.disabled || component.loading }
			isBusy={ pending || component.loading }
			__next40pxDefaultSize
			aria-busy={ pending || component.loading || undefined }
			onClick={ () => onAction( component.action ) }
		>
			{ component.label }
		</GutenbergButton>
	);
}

interface RendererContext {
	renderChildren: ( component: ComponentNode ) => ReactNode;
	read: ( path: string ) => JsonValue | undefined;
	write: ( path: string, value: string | string[] ) => void;
	disabled: boolean;
	pending: boolean;
	canDispatch: ( action: string ) => boolean;
	dispatch: ( action: string ) => void;
	fieldId: ( id: string ) => string;
}

interface RendererDefinition {
	render: ( component: ComponentNode, context: RendererContext ) => ReactNode;
}

const componentRenderers: Readonly< Record< string, RendererDefinition > > = {
	Column: {
		render: ( component, context ) => <Column>{ context.renderChildren( component ) }</Column>,
	},
	Row: {
		render: ( component, context ) => <Row>{ context.renderChildren( component ) }</Row>,
	},
	Text: {
		render: ( node, context ) => {
			const component = node as TextComponent;
			return (
				<Text
					component={ component }
					value={ 'path' in component.content ? context.read( component.content.path ) : undefined }
				/>
			);
		},
	},
	TextField: {
		render: ( node, context ) => {
			const component = node as TextFieldComponent;
			return (
				<TextField
					component={ component }
					value={ context.read( component.path ) as string }
					disabled={ context.disabled }
					id={ context.fieldId( component.id ) }
					onChange={ ( value ) => context.write( component.path, value ) }
				/>
			);
		},
	},
	ChoicePicker: {
		render: ( node, context ) => {
			const component = node as ChoicePickerComponent;
			return (
				<ChoicePicker
					component={ component }
					value={ context.read( component.path ) as string | string[] }
					disabled={ context.disabled }
					id={ context.fieldId( component.id ) }
					onChange={ ( value ) => context.write( component.path, value ) }
				/>
			);
		},
	},
	Button: {
		render: ( node, context ) => {
			const component = node as ButtonComponent;
			return (
				<Button
					component={ component }
					disabled={ context.disabled || ! context.canDispatch( component.action ) }
					pending={ context.pending }
					onAction={ context.dispatch }
				/>
			);
		},
	},
};

export interface RendererMessages {
	pending: string;
}

export interface SurfaceRendererProps {
	surface: Surface;
	allowedActions?: ReadonlySet< string >;
	actionBindings?: Readonly< Record< string, readonly string[] > >;
	disabled?: boolean;
	pending?: boolean;
	identity?: string;
	locale?: string;
	messages?: RendererMessages;
	onAction: ( event: ActionEvent ) => void;
}

export function SurfaceRenderer( {
	surface,
	allowedActions = new Set< string >(),
	actionBindings = {},
	disabled = false,
	pending = false,
	identity,
	locale,
	messages = { pending: 'Submitting…' },
	onAction,
}: SurfaceRendererProps ) {
	const idPrefix = useId();
	const currentIdentity = identity ?? surface;
	const [ state, setState ] = useState< {
		identity: string | Surface;
		data: DataModel;
		source: Surface;
		submitted: string[];
	} >( () => ( {
		identity: currentIdentity,
		data: surface.data,
		source: surface,
		submitted: [],
	} ) );
	let draft = state.identity === currentIdentity ? state.data : surface.data;
	if ( state.source !== surface || state.identity !== currentIdentity ) {
		draft = surface.data;
		if ( state.identity === currentIdentity ) {
			for ( const component of Object.values( surface.components ) ) {
				if (
					( component.type === 'TextField' || component.type === 'ChoicePicker' ) &&
					! state.submitted.includes( component.path ) &&
					JSON.stringify( readBinding( state.data, component.path ) ) !==
						JSON.stringify( readBinding( state.source.data, component.path ) )
				) {
					const value = readBinding( state.data, component.path );
					if (
						typeof value === 'string' ||
						( Array.isArray( value ) && value.every( ( item ) => typeof item === 'string' ) )
					) {
						draft = writeBinding( draft, component.path, value ) ?? draft;
					}
				}
			}
		}
		setState( { identity: currentIdentity, data: draft, source: surface, submitted: [] } );
	}
	const bindings = Object.values( surface.components ).flatMap( ( component ) =>
		componentDefinitions[ component.type ].bindings( component )
	);
	const inactive = disabled || pending || allowedActions.size === 0;
	function valuesFor( action: string ): ActionEvent[ 'values' ] | null {
		if ( inactive || ! allowedActions.has( action ) || ! Object.hasOwn( actionBindings, action ) ) {
			return null;
		}
		const values: ActionEvent[ 'values' ] = {};
		for ( const path of actionBindings[ action ] ) {
			const editors = bindings.filter( ( binding ) => binding.editable && binding.path === path );
			if ( editors.length === 0 || editors.some( ( binding ) => binding.disabled ) ) {
				return null;
			}
			const value = readBinding( draft, path );
			if ( typeof value === 'string' ) {
				values[ path ] = value;
			} else if ( Array.isArray( value ) && value.every( ( item ) => typeof item === 'string' ) ) {
				values[ path ] = [ ...value ] as string[];
			} else {
				return null;
			}
		}
		return values;
	}
	const context: RendererContext = {
		renderChildren: ( component ) =>
			componentDefinitions[ component.type ].children( component ).map( render ),
		read: ( path ) => readBinding( draft, path ),
		write: ( path, value ) => {
			const editors = bindings.filter( ( binding ) => binding.editable && binding.path === path );
			if ( inactive || editors.length === 0 || editors.some( ( binding ) => binding.disabled ) ) {
				return;
			}
			const next = writeBinding( draft, path, value );
			if ( next ) {
				setState( { ...state, identity: currentIdentity, data: next } );
			}
		},
		disabled: inactive,
		pending,
		canDispatch: ( action ) => valuesFor( action ) !== null,
		dispatch: ( action ) => {
			const values = valuesFor( action );
			if ( values ) {
				setState( { ...state, submitted: Object.keys( values ) } );
				onAction( { name: action, values } );
			}
		},
		fieldId: ( id ) => `${ idPrefix }-${ id }`,
	};
	function render( id: string ): ReactNode {
		const component = surface.components[ id ];
		const entry = componentRenderers[ component.type ];
		if ( ! entry ) {
			throw new Error( 'This interaction could not be displayed.' );
		}
		return <Fragment key={ id }>{ entry.render( component, context ) }</Fragment>;
	}
	return (
		<div className="agent-components" lang={ locale }>
			{ render( surface.rootId ) }
			{ pending && (
				<span className="agent-components-announcement" role="status">
					{ messages.pending }
				</span>
			) }
		</div>
	);
}
