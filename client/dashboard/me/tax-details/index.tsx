import { useMutation, useQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	Notice,
	SelectControl,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { userTaxDetailsQuery, userTaxDetailsMutation } from '../../app/queries/user-tax-details';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import useDataFormCountryCodes from './use-data-form-country-codes';
import type { UserTaxDetails } from '../../data/types';
import type { Field } from '@wordpress/dataviews';

const fields: Field< UserTaxDetails >[] = [
	{
		id: 'country',
		label: __( 'Country' ),
		type: 'text',
		Edit: ( { data, field, onChange } ) => {
			const value = field.getValue( { item: data } );
			const label = __( 'Country' );
			const countryCodes = useDataFormCountryCodes();

			return (
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ label }
					value={ value }
					options={ countryCodes }
					onChange={ onChange }
				/>
			);
		},
	},
	{
		id: 'vat_id',
		label: __( 'VAT ID' ),
		type: 'text',
	},
	{
		id: 'name',
		label: __( 'Name' ),
		type: 'text',
	},
	{
		id: 'address',
		label: __( 'Address' ),
		type: 'text',
	},
];

const form = {
	type: 'regular' as const,
	labelPosition: 'top' as const,
	fields: [
		{
			id: 'vatDetails',
			label: __( 'Add tax (VAT/GST/CT) details' ),
			children: [ 'country', 'vat_id', 'name', 'address' ],
		},
	],
};

export default function TaxDetails() {
	const { data: serverData } = useQuery( userTaxDetailsQuery() );
	const [ localData, setLocalData ] = useState< Partial< UserTaxDetails > | undefined >();
	const [ savingData, setSavingData ] = useState< Partial< UserTaxDetails > | undefined >();
	const data = useMemo(
		() => ( serverData ? { ...serverData, ...savingData, ...localData } : undefined ),
		[ serverData, savingData, localData ]
	);
	const mutation = useMutation( userTaxDetailsMutation() );

	if ( ! data ) {
		return;
	}

	const isSaving = mutation.isPending;
	const isDirty =
		!! localData &&
		!! serverData &&
		Object.entries( localData ).some( ( [ key, value ] ) => {
			return serverData[ key as keyof UserTaxDetails ] !== value;
		} );
	let saveButtonLabel = __( 'Save' );

	if ( isSaving ) {
		saveButtonLabel = __( 'Saving…' );
	} else if ( mutation.isSuccess && ! isDirty ) {
		saveButtonLabel = __( 'Saved!' );
	}

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( localData ) {
			const mutationData = localData;
			setLocalData( undefined );
			setSavingData( mutationData );
			mutation.mutate( mutationData, {
				onSettled: () => {
					setSavingData( undefined );
				},
				onError: () => {
					setLocalData( ( currentData ) => ( { ...mutationData, ...currentData } ) );
				},
			} );
		}
	};

	return (
		<form onSubmit={ handleSubmit }>
			<PageLayout size="small" header={ <PageHeader title={ __( 'Tax Details' ) } /> }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 } alignment="left">
							<DataForm< UserTaxDetails >
								data={ data }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< UserTaxDetails > ) => {
									setLocalData( ( current ) => ( { ...current, ...edits } ) );
								} }
							/>

							{ mutation.error && (
								<Notice status="error" isDismissible={ false }>
									{ mutation.error.message }
								</Notice>
							) }

							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty }
							>
								{ saveButtonLabel }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			</PageLayout>
		</form>
	);
}
