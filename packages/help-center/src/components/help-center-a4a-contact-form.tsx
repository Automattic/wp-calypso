/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FormInputValidation } from '@automattic/components';
import { Button, SelectControl, TextareaControl, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
/**
 * Internal Dependencies
 */
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import './help-center-a4a-contact-form.scss';
import { useSubmitA4ATicketMutation } from '../data/use-submit-a4a-support-ticket';

export const HelpCenterA4AContactForm = () => {
	const { currentUser, agency } = useHelpCenterContext();
	const navigate = useNavigate();

	const [ formData, setFormData ] = useState( {
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

	const isPressableSelected = formData[ 'product' ] === 'pressable';

	const handleChange = ( key: string, value: string ) => {
		setFormData( { ...formData, [ key ]: value } );
	};

	const handleSubmit = useCallback( () => {
		recordTracksEvent( 'calypso_a4a_user_contact_support_form_submit', {
			data: formData[ 'message' ],
		} );

		submitA4ATicket(
			{
				name: formData[ 'name' ],
				email: formData[ 'email' ],
				message: formData[ 'message' ],
				product: formData[ 'product' ],
				agency_id: agency?.id,
				pressable_id: agency?.pressableId,
				site: formData[ 'site' ] ?? undefined,
				contact_type: isPressableSelected ? formData[ 'pressable_contact' ] : undefined,
			},
			{
				onSuccess: () => {
					navigate( '/success' );
				},
			}
		);
	}, [
		formData,
		submitA4ATicket,
		agency?.id,
		agency?.pressableId,
		isPressableSelected,
		navigate,
	] );

	useEffect( () => {
		if ( formData[ 'product' ] === 'pressable' ) {
			setFormData( { ...formData, pressable_contact: 'sales' } );
		}
	}, [ formData ] );

	const isValidForm = useMemo( () => {
		return (
			formData[ 'name' ] && formData[ 'email' ] && formData[ 'product' ] && formData[ 'message' ]
		);
	}, [ formData ] );

	return (
		<div className="help-center-a4a-contact-form__wrapper">
			<div className="help-center-a4a-contact-form">
				<h1 className="help-center-a4a-contact-form__title">
					{ __( 'Contact sales & support', __i18n_text_domain__ ) }
				</h1>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Name', __i18n_text_domain__ ) }
					placeholder={ __( 'Your name', __i18n_text_domain__ ) }
					value={ formData[ 'name' ] }
					onChange={ ( value ) => handleChange( 'name', value ) }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Email address', __i18n_text_domain__ ) }
					value={ formData[ 'email' ] }
					placeholder={ __( 'Your email', __i18n_text_domain__ ) }
					onChange={ ( value ) => handleChange( 'email', value ) }
				/>

				<TextControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'Related site', __i18n_text_domain__ ) }
					value={ formData[ 'site' ] }
					placeholder={ __( 'Add site if necessary', __i18n_text_domain__ ) }
					onChange={ ( value ) => handleChange( 'site', value ) }
				/>

				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ __( 'What Automattic product would you like help with?', __i18n_text_domain__ ) }
					onChange={ ( value ) => handleChange( 'product', value ) }
					options={ [
						{
							label: __( 'Select a product', __i18n_text_domain__ ),
							value: '',
							disabled: true,
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
					] }
				/>

				{ isPressableSelected && (
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __(
							'Would you like help with Pressable sales or support?',
							__i18n_text_domain__
						) }
						onChange={ ( value ) => handleChange( 'pressable_contact', value ) }
						options={ [
							{
								label: __( 'Sales', __i18n_text_domain__ ),
								value: 'sales',
							},
							{
								label: __( 'Support', __i18n_text_domain__ ),
								value: 'support',
							},
						] }
					/>
				) }

				<TextareaControl
					__nextHasNoMarginBottom
					label={ __( 'How can we help?', __i18n_text_domain__ ) }
					value={ formData[ 'message' ] }
					placeholder={
						isPressableSelected
							? __(
									"Please provide the team with a detailed explanation of the issue you're facing, including steps to reproduce the issue on our end and/or URLs. Providing these details will greatly help us with your support request.",
									__i18n_text_domain__
							  )
							: __( 'Add your message here', __i18n_text_domain__ )
					}
					onChange={ ( value ) => handleChange( 'message', value ) }
				/>
			</div>

			<div className="contact-form-submit">
				{ hasSubmitError && (
					<FormInputValidation
						isError
						text={ __( 'Something went wrong, please try again later.', __i18n_text_domain__ ) }
					/>
				) }

				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleSubmit }
					disabled={ ! isValidForm || isPending }
				>
					{ __( 'Submit form', __i18n_text_domain__ ) }
				</Button>
			</div>
		</div>
	);
};
