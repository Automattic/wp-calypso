import { FormLabel } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect } from 'react';
import { Control, Controller, FieldError, useForm } from 'react-hook-form';
import FormTextArea from 'calypso/components/forms/form-textarea';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import {
	type TicketMigrationData,
	useMigrationTicketMutation,
} from '../../hooks/use-migration-ticket-mutation';

interface CheckboxProps {
	label: string;
	control: Control< TicketMigrationData >;
	value: string;
}

const CheckboxIntents = ( { label, control, value }: CheckboxProps ) => (
	<Controller
		control={ control }
		name="intents"
		render={ ( { field } ) => {
			return (
				<CheckboxControl
					className="site-migration-already-wpcom__form-checkbox-control"
					onChange={ ( isChecked ) => {
						if ( isChecked ) {
							field.onChange( [ ...field.value, value ] );
						} else {
							field.onChange( field.value.filter( ( v ) => v !== value ) );
						}
					} }
					checked={ field.value.includes( value ) }
					label={ label }
					name={ field.name }
				/>
			);
		} }
	/>
);

interface OtherDetailsProps {
	label: string;
	control: Control< TicketMigrationData >;
	error?: FieldError;
}

const OtherDetails = ( { label, control, error }: OtherDetailsProps ) => {
	const translate = useTranslate();
	return (
		<Controller
			control={ control }
			name="otherDetails"
			rules={ { required: translate( 'Please, provide more details.' ) } }
			render={ ( { field } ) => {
				return (
					<div className="site-migration-already-wpcom__form-textarea-container">
						<FormLabel htmlFor="otherDetails"> { label } </FormLabel>
						<FormTextArea
							id="otherDetails"
							value={ field.value }
							onChange={ field.onChange }
							placeholder={ translate(
								'Share any other details that will help us figure out what we need to do next.'
							) }
							className={ clsx( 'site-migration-already-wpcom__form-textarea', {
								'site-migration-already-wpcomrm-textarea--error': error,
							} ) }
						/>
						{ error && error.message && (
							<p className="site-migration-already-wpcomrror">{ error.message }</p>
						) }
					</div>
				);
			} }
		/>
	);
};

interface FormProps {
	onComplete: () => void;
}

const Form: FC< FormProps > = ( { onComplete } ) => {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam() ?? '';

	const {
		control,
		handleSubmit,
		watch,
		setError,
		formState: { errors },
	} = useForm< TicketMigrationData >( {
		defaultValues: {
			intents: [],
			otherDetails: '',
		},
	} );

	const { mutate: createTicket, isSuccess } = useMigrationTicketMutation( siteSlug );

	useEffect( () => {
		if ( isSuccess ) {
			if ( process.env.NODE_ENV !== 'test' ) {
				alert( 'Success!' );
			}
			onComplete();
		}
	}, [ isSuccess, onComplete ] );

	const onSubmit = handleSubmit( ( data: TicketMigrationData ) => {
		if ( data.intents.length === 0 ) {
			setError( 'intents', {
				type: 'manual',
				message: translate( 'Please select an option.' ),
			} );
		}
		createTicket( {
			intents: data.intents,
			otherDetails: data.otherDetails,
		} );
	} );

	const intents = watch( 'intents' );
	const isOtherChecked = intents.includes( 'other' );

	return (
		<div className="site-migration-already-wpcominer">
			<form className="site-migration-already-wpcom__form" onSubmit={ onSubmit }>
				<div className="site-migration-already-wpcom__form-content">
					<div className="site-migration-already-wpcom__form-title-container">
						<h4
							className={ clsx( 'site-migration-already-wpcomitle', {
								'site-migration-already-wpcom__form-title--error': errors.intents,
							} ) }
						>
							{ translate( 'What brought you here today?' ) }
						</h4>
						{ errors.intents && (
							<p className="site-migration-already-wpcom__form-error">
								{ errors.intents.message }
							</p>
						) }
					</div>
					<CheckboxIntents
						value="transfer-my-domain-to-wordpress-com"
						label={ translate( 'Transfer my domain to WordPress.com' ) }
						control={ control }
					/>
					<CheckboxIntents
						value="copy-one-of-my-existing-sites-on-wordpress-com"
						label={ translate( 'Copy one of my existing sites on WordPress.com' ) }
						control={ control }
					/>
					<CheckboxIntents
						value="get-access-to-my-old-site-on-wordpress-com"
						label={ translate( 'Get access to my old site on WordPress.com' ) }
						control={ control }
					/>

					<CheckboxIntents value="other" label={ translate( 'Other' ) } control={ control } />

					{ isOtherChecked && (
						<OtherDetails
							label={ translate( 'Other details' ) }
							control={ control }
							error={ errors.otherDetails }
						/>
					) }
				</div>
				<NextButton type="submit">{ translate( 'Continue' ) }</NextButton>
			</form>
		</div>
	);
};

export default Form;
