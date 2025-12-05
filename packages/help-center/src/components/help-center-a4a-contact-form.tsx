/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	Button,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	Notice,
} from '@wordpress/components';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import './help-center-a4a-contact-form.scss';
import { useSubmitA4ATicketMutation } from '../data/use-submit-a4a-support-ticket';
import type { Field } from '@wordpress/dataviews';

type FormData = {
	name: string;
	email: string;
	site: string;
	product: string;
	message: string;
	pressable_contact: string;
};

const FORM_CONFIG = {
	layout: { type: 'regular' as const },
	fields: [ 'name', 'email', 'site', 'product', 'pressable_contact', 'message' ],
};

const fields: Field< FormData >[] = [
	{
		id: 'name',
		label: __( 'Name', __i18n_text_domain__ ),
		type: 'text' as const,
		placeholder: __( 'Your name', __i18n_text_domain__ ),
		isValid: {
			required: true,
		},
	},
	{
		id: 'email',
		label: __( 'Email address', __i18n_text_domain__ ),
		type: 'text' as const,
		placeholder: __( 'Your email', __i18n_text_domain__ ),
		isValid: {
			required: true,
		},
	},
	{
		id: 'site',
		label: __( 'Related site', __i18n_text_domain__ ),
		type: 'text' as const,
		placeholder: __( 'Add site if necessary', __i18n_text_domain__ ),
	},
	{
		id: 'product',
		label: __( 'What Automattic product would you like help with?', __i18n_text_domain__ ),
		type: 'text' as const,
		Edit: 'select',
		elements: [
			{
				label: __( 'Automattic for Agencies', __i18n_text_domain__ ),
				value: 'a4a',
			},
			{
				label: __( 'Woo', __i18n_text_domain__ ),
				value: 'woo',
			},
			{
				label: __( 'WordPress.com', __i18n_text_domain__ ),
				value: 'wpcom',
			},
			{
				label: __( 'Jetpack', __i18n_text_domain__ ),
				value: 'jetpack',
			},
			{
				label: __( 'Pressable', __i18n_text_domain__ ),
				value: 'pressable',
			},
		],
		isValid: {
			required: true,
		},
	},
	{
		id: 'pressable_contact',
		label: __( 'Would you like help with Pressable sales or support?', __i18n_text_domain__ ),
		type: 'text' as const,
		Edit: 'select',
		elements: [
			{
				label: __( 'Sales', __i18n_text_domain__ ),
				value: 'sales',
			},
			{
				label: __( 'Support', __i18n_text_domain__ ),
				value: 'support',
			},
		],
		isVisible: ( item: FormData ) => item.product === 'pressable',
	},
	{
		id: 'message',
		label: __( 'How can we help?', __i18n_text_domain__ ),
		type: 'text' as const,
		Edit: ( { field, data, onChange } ) => {
			const { id, getValue } = field;
			const placeholder =
				data.product === 'pressable'
					? __(
							"Please provide the team with a detailed explanation of the issue you're facing, including steps to reproduce the issue on our end and/or URLs. Providing these details will greatly help us with your support request.",
							__i18n_text_domain__
					  )
					: __( 'Add your message here', __i18n_text_domain__ );
			return (
				<TextareaControl
					__nextHasNoMarginBottom
					label={ field.label }
					placeholder={ placeholder }
					value={ getValue( { item: data } ) }
					onChange={ ( value ) => {
						return onChange( { [ id ]: value ?? '' } );
					} }
				/>
			);
		},
		isValid: {
			required: true,
		},
	},
];

export const HelpCenterA4AContactForm = () => {
	const { currentUser, agency } = useHelpCenterContext();
	const navigate = useNavigate();

	const [ formData, setFormData ] = useState< FormData >( {
		name: currentUser?.display_name ?? '',
		email: currentUser?.email ?? '',
		site: '',
		product: 'a4a',
		message: '',
		pressable_contact: 'sales',
	} );

	const {
		isPending,
		mutate: submitA4ATicket,
		isError: hasSubmitError,
	} = useSubmitA4ATicketMutation();

	const isPressableSelected = formData.product === 'pressable';

	const { validity } = useFormValidity( formData, fields, FORM_CONFIG );

	const handleSubmit = useCallback(
		( e: React.FormEvent ) => {
			e.preventDefault();
			recordTracksEvent( 'calypso_a4a_user_contact_support_form_submit', {
				data: formData.message,
			} );

			submitA4ATicket(
				{
					name: formData.name,
					email: formData.email,
					message: formData.message,
					product: formData.product,
					agency_id: agency?.id,
					pressable_id: agency?.pressableId,
					site: formData.site || undefined,
					contact_type: isPressableSelected ? formData.pressable_contact : undefined,
				},
				{
					onSuccess: () => {
						navigate( '/success' );
					},
				}
			);
		},
		[ formData, submitA4ATicket, agency?.id, agency?.pressableId, isPressableSelected, navigate ]
	);

	const isValidForm = ! validity;

	return (
		<form onSubmit={ handleSubmit } className="help-center-a4a-contact-form">
			<VStack spacing={ 4 } justify="flex-start">
				<Heading level={ 3 }>{ __( 'Contact sales & support', __i18n_text_domain__ ) }</Heading>

				<DataForm< FormData >
					data={ formData }
					fields={ fields }
					form={ FORM_CONFIG }
					validity={ validity }
					onChange={ ( edits: Partial< FormData > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>

				<Button
					__next40pxDefaultSize
					variant="primary"
					type="submit"
					disabled={ ! isValidForm || isPending }
					isBusy={ isPending }
				>
					{ __( 'Submit form', __i18n_text_domain__ ) }
				</Button>

				{ hasSubmitError && (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'Something went wrong. Please try again later.', __i18n_text_domain__ ) }
					</Notice>
				) }
			</VStack>
		</form>
	);
};
