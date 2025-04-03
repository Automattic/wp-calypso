/**
 * WordPress dependencies
 */
import { useContext, useMemo } from '@wordpress/element';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import type { Form, FieldLayoutProps } from '../../types';
import DataFormContext from '../../components/dataform-context';
import { DataFormLayout } from '../data-form-layout';
import { isCombinedField } from '../is-combined-field';

function Header( { title }: { title: string } ) {
	return (
		<VStack className="dataforms-layouts-regular__header" spacing={ 4 }>
			<HStack alignment="center">
				<Heading level={ 2 } size={ 13 }>
					{ title }
				</Heading>
				<Spacer />
			</HStack>
		</VStack>
	);
}

export default function FormRegularField< Item >( {
	data,
	field,
	onChange,
	hideLabelFromVision,
}: FieldLayoutProps< Item > ) {
	const { fields } = useContext( DataFormContext );

	const form = useMemo( () => {
		if ( isCombinedField( field ) ) {
			return {
				fields: field.children.map( ( child ) => {
					if ( typeof child === 'string' ) {
						return {
							id: child,
						};
					}
					return child;
				} ),
				type: 'regular' as const,
			};
		}

		return {
			type: 'regular' as const,
			fields: [],
		};
	}, [ field ] );

	if ( isCombinedField( field ) ) {
		return (
			<>
				{ ! hideLabelFromVision && field.label && (
					<Header title={ field.label } />
				) }
				<DataFormLayout
					data={ data }
					form={ form as Form }
					onChange={ onChange }
				/>
			</>
		);
	}

	const labelPosition = field.labelPosition ?? 'top';
	const fieldDefinition = fields.find(
		( fieldDef ) => fieldDef.id === field.id
	);

	if ( ! fieldDefinition ) {
		return null;
	}
	if ( labelPosition === 'side' ) {
		return (
			<HStack className="dataforms-layouts-regular__field">
				<div className="dataforms-layouts-regular__field-label">
					{ fieldDefinition.label }
				</div>
				<div className="dataforms-layouts-regular__field-control">
					<fieldDefinition.Edit
						key={ fieldDefinition.id }
						data={ data }
						field={ fieldDefinition }
						onChange={ onChange }
						hideLabelFromVision
					/>
				</div>
			</HStack>
		);
	}

	return (
		<div className="dataforms-layouts-regular__field">
			<fieldDefinition.Edit
				data={ data }
				field={ fieldDefinition }
				onChange={ onChange }
				hideLabelFromVision={
					labelPosition === 'none' ? true : hideLabelFromVision
				}
			/>
		</div>
	);
}
