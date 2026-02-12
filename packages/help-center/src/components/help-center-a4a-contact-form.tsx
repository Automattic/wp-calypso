/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	Button,
	TextareaControl,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	Notice,
	TextControl,
} from '@wordpress/components';
import { DataForm, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
	no_of_sites: number;
};

const FORM_CONFIG = {
	layout: { type: 'regular' as const },
	fields: [ 'name', 'email', 'site', 'no_of_sites', 'product', 'pressable_contact', 'message' ],
};

export const HelpCenterA4AContactForm = () => {
	const { currentUser, agency } = useHelpCenterContext();
	const [ searchParams ] = useSearchParams();
	const isMigrationRequest = !! searchParams.get( 'migration-request' );

	const navigate = useNavigate();

	const [ formData, setFormData ] = useState< FormData >( {
		name: currentUser?.display_name ?? '',
		email: currentUser?.email ?? '',
		site: '',
		product: '',
		message: isMigrationRequest
			? __( "I'd like to migrate from [insert your current host here].", __i18n_text_domain__ )
			: '',
		no_of_sites: 1,
		pressable_contact: 'sales',
	} );

	const {
		isPending,
		mutate: submitA4ATicket,
		isError: hasSubmitError,
	} = useSubmitA4ATicketMutation();

	const isPressableSelected = formData.product === 'pressable';

	const fields: Field< FormData >[] = useMemo(
		() => [
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
			isMigrationRequest
				? {
						id: 'no_of_sites',
						label: __( 'Number of sites', __i18n_text_domain__ ),
						type: 'number' as const,
						Edit: ( { field, data, onChange } ) => {
							const { id, getValue } = field;
							return (
								<TextControl
									__nextHasNoMarginBottom
									type="number"
									min="1"
									label={ field.label }
									value={ getValue( { item: data } ) }
									onChange={ ( value ) => {
										return onChange( { [ id ]: value ? Number( value ) : '' } );
									} }
								/>
							);
						},
						placeholder: __( 'Add number of sites you plan to migrate', __i18n_text_domain__ ),
						isValid: {
							required: true,
						},
				  }
				: {
						id: 'site',
						label: __( 'Related site', __i18n_text_domain__ ),
						type: 'text' as const,
						placeholder: __( 'Add site if necessary', __i18n_text_domain__ ),
				  },
			{
				id: 'product',
				label: isMigrationRequest
					? __( 'Where would you like us to migrate your site?', __i18n_text_domain__ )
					: __( 'What product would you like help with?', __i18n_text_domain__ ),
				type: 'text' as const,
				Edit: 'select',
				elements: isMigrationRequest
					? [
							{
								label: __( 'Choose a product', __i18n_text_domain__ ),
								value: '',
							},
							{
								label: __( 'WordPress.com', __i18n_text_domain__ ),
								value: 'wpcom',
							},
							{
								label: __( 'Pressable', __i18n_text_domain__ ),
								value: 'pressable',
							},
							{
								label: __( 'I need help to decide', __i18n_text_domain__ ),
								value: 'dont-know',
							},
					  ]
					: [
							{
								label: __( 'Choose a product', __i18n_text_domain__ ),
								value: '',
							},
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
				label: isMigrationRequest
					? __(
							'Anything we should know about your current site(s) or migration needs?',
							__i18n_text_domain__
					  )
					: __( 'How can we help?', __i18n_text_domain__ ),
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
		],
		[ isMigrationRequest ]
	);

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
					no_of_sites: isMigrationRequest ? formData.no_of_sites : undefined,
					contact_type: isPressableSelected ? formData.pressable_contact : undefined,
					tags: isMigrationRequest ? [ 'a4a_form_dash_migration' ] : undefined,
				},
				{
					onSuccess: () => {
						navigate( '/success' );
					},
				}
			);
		},
		[
			formData.message,
			formData.name,
			formData.email,
			formData.product,
			formData.site,
			formData.no_of_sites,
			formData.pressable_contact,
			submitA4ATicket,
			agency?.id,
			agency?.pressableId,
			isMigrationRequest,
			isPressableSelected,
			navigate,
		]
	);

	const isValidForm = ! validity;

	return (
		<form onSubmit={ handleSubmit } className="help-center-a4a-contact-form">
			<VStack spacing={ 4 } justify="flex-start">
				<Heading level={ 3 }>
					{ isMigrationRequest
						? __( 'Request a Free Concierge Migration', __i18n_text_domain__ )
						: __( 'Contact sales & support', __i18n_text_domain__ ) }
				</Heading>

				{ isMigrationRequest && (
					<Text>
						{ __(
							'We’ll help move your site to Pressable or WordPress.com for free. Fill out this short form, and our team will get in touch to assist with your migration.',
							__i18n_text_domain__
						) }
					</Text>
				) }

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
					variant="primary"
					type="submit"
					disabled={ ! isValidForm || isPending }
					isBusy={ isPending }
				>
					{ __( 'Send message', __i18n_text_domain__ ) }
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
