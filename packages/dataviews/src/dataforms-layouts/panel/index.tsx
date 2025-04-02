/**
 * WordPress dependencies
 */
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	Dropdown,
	Button,
} from '@wordpress/components';
import { sprintf, __, _x } from '@wordpress/i18n';
import { useState, useMemo, useContext } from '@wordpress/element';
import { closeSmall } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import type {
	Form,
	FormField,
	FieldLayoutProps,
	NormalizedField,
	SimpleFormField,
} from '../../types';
import DataFormContext from '../../components/dataform-context';
import { DataFormLayout } from '../data-form-layout';
import { isCombinedField } from '../is-combined-field';

function DropdownHeader( {
	title,
	onClose,
}: {
	title?: string;
	onClose: () => void;
} ) {
	return (
		<VStack
			className="dataforms-layouts-panel__dropdown-header"
			spacing={ 4 }
		>
			<HStack alignment="center">
				{ title && (
					<Heading level={ 2 } size={ 13 }>
						{ title }
					</Heading>
				) }
				<Spacer />
				{ onClose && (
					<Button
						label={ __( 'Close' ) }
						icon={ closeSmall }
						onClick={ onClose }
						size="small"
					/>
				) }
			</HStack>
		</VStack>
	);
}

function PanelDropdown< Item >( {
	fieldDefinition,
	popoverAnchor,
	labelPosition = 'side',
	data,
	onChange,
	field,
}: {
	fieldDefinition: NormalizedField< Item >;
	popoverAnchor: HTMLElement | null;
	labelPosition: 'side' | 'top' | 'none';
	data: Item;
	onChange: ( value: any ) => void;
	field: FormField;
} ) {
	const fieldLabel = isCombinedField( field )
		? field.label
		: fieldDefinition?.label;
	const form = useMemo( () => {
		if ( isCombinedField( field ) ) {
			return {
				type: 'regular' as const,
				fields: field.children.map( ( child ) => {
					if ( typeof child === 'string' ) {
						return {
							id: child,
						};
					}
					return child;
				} ),
			};
		}
		// If not explicit children return the field id itself.
		return {
			type: 'regular' as const,
			fields: [ { id: field.id } ],
		};
	}, [ field ] );

	// Memoize popoverProps to avoid returning a new object every time.
	const popoverProps = useMemo(
		() => ( {
			// Anchor the popover to the middle of the entire row so that it doesn't
			// move around when the label changes.
			anchor: popoverAnchor,
			placement: 'left-start',
			offset: 36,
			shift: true,
		} ),
		[ popoverAnchor ]
	);

	return (
		<Dropdown
			contentClassName="dataforms-layouts-panel__field-dropdown"
			popoverProps={ popoverProps }
			focusOnMount
			toggleProps={ {
				size: 'compact',
				variant: 'tertiary',
				tooltipPosition: 'middle left',
			} }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					className="dataforms-layouts-panel__field-control"
					size="compact"
					variant={
						[ 'none', 'top' ].includes( labelPosition )
							? 'link'
							: 'tertiary'
					}
					aria-expanded={ isOpen }
					aria-label={ sprintf(
						// translators: %s: Field name.
						_x( 'Edit %s', 'field' ),
						fieldLabel
					) }
					onClick={ onToggle }
				>
					<fieldDefinition.render item={ data } />
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<>
					<DropdownHeader title={ fieldLabel } onClose={ onClose } />
					<DataFormLayout
						data={ data }
						form={ form as Form }
						onChange={ onChange }
					>
						{ ( FieldLayout, nestedField ) => (
							<FieldLayout
								key={ nestedField.id }
								data={ data }
								field={ nestedField }
								onChange={ onChange }
								hideLabelFromVision={
									( form?.fields ?? [] ).length < 2
								}
							/>
						) }
					</DataFormLayout>
				</>
			) }
		/>
	);
}

export default function FormPanelField< Item >( {
	data,
	field,
	onChange,
}: FieldLayoutProps< Item > ) {
	const { fields } = useContext( DataFormContext );
	const fieldDefinition = fields.find( ( fieldDef ) => {
		// Default to the first child if it is a combined field.
		if ( isCombinedField( field ) ) {
			const children = field.children.filter(
				( child ): child is string | SimpleFormField =>
					typeof child === 'string' || ! isCombinedField( child )
			);
			const firstChildFieldId =
				typeof children[ 0 ] === 'string'
					? children[ 0 ]
					: children[ 0 ].id;
			return fieldDef.id === firstChildFieldId;
		}
		return fieldDef.id === field.id;
	} );
	const labelPosition = field.labelPosition ?? 'side';

	// Use internal state instead of a ref to make sure that the component
	// re-renders when the popover's anchor updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState< HTMLElement | null >(
		null
	);

	if ( ! fieldDefinition ) {
		return null;
	}

	const fieldLabel = isCombinedField( field )
		? field.label
		: fieldDefinition?.label;

	if ( labelPosition === 'top' ) {
		return (
			<VStack className="dataforms-layouts-panel__field" spacing={ 0 }>
				<div
					className="dataforms-layouts-panel__field-label"
					style={ { paddingBottom: 0 } }
				>
					{ fieldLabel }
				</div>
				<div className="dataforms-layouts-panel__field-control">
					<PanelDropdown
						field={ field }
						popoverAnchor={ popoverAnchor }
						fieldDefinition={ fieldDefinition }
						data={ data }
						onChange={ onChange }
						labelPosition={ labelPosition }
					/>
				</div>
			</VStack>
		);
	}

	if ( labelPosition === 'none' ) {
		return (
			<div className="dataforms-layouts-panel__field">
				<PanelDropdown
					field={ field }
					popoverAnchor={ popoverAnchor }
					fieldDefinition={ fieldDefinition }
					data={ data }
					onChange={ onChange }
					labelPosition={ labelPosition }
				/>
			</div>
		);
	}

	// Defaults to label position side.
	return (
		<HStack
			ref={ setPopoverAnchor }
			className="dataforms-layouts-panel__field"
		>
			<div className="dataforms-layouts-panel__field-label">
				{ fieldLabel }
			</div>
			<div className="dataforms-layouts-panel__field-control">
				<PanelDropdown
					field={ field }
					popoverAnchor={ popoverAnchor }
					fieldDefinition={ fieldDefinition }
					data={ data }
					onChange={ onChange }
					labelPosition={ labelPosition }
				/>
			</div>
		</HStack>
	);
}
