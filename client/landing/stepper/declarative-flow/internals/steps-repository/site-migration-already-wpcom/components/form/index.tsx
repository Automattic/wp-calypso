import { FormLabel } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect } from 'react';
import { Control, Controller, FieldError, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import FormTextArea from 'calypso/components/forms/form-textarea';
import Notice from 'calypso/components/notice';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { logToLogstash } from 'calypso/lib/logstash';
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
					className="already-wpcom__form-checkbox-control"
					disabled={ field.disabled }
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
					<div className="already-wpcom__form-textarea-container">
						<FormLabel htmlFor="otherDetails"> { label } </FormLabel>
						<FormTextArea
							id="otherDetails"
							disabled={ field.disabled }
							value={ field.value }
							onChange={ field.onChange }
							onBlur={ field.onBlur }
							placeholder={ translate(
								'Share any other details that will help us figure out what we need to do next.'
							) }
							className={ clsx( 'already-wpcom__form-textarea', {
								'already-wpcom__form-textarea--error': error,
							} ) }
						/>
						{ error && error.message && (
							<p className="already-wpcom__form-error">{ error.message }</p>
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
	const [ queryParams ] = useSearchParams();
	const from = queryParams.get( 'from' );

	const {
		mutate: createTicket,
		isSuccess,
		error,
		isPending,
	} = useMigrationTicketMutation( siteSlug );

	const {
		control,
		handleSubmit,
		watch,
		setError,
		formState: { errors },
	} = useForm< TicketMigrationData >( {
		disabled: isPending,
		defaultValues: {
			intents: [],
			otherDetails: '',
		},
	} );
	const intents = watch( 'intents' );
	const isOtherChecked = intents.includes( 'other' );
	const errorMessage = errors?.root?.message ?? errors?.intents?.message;

	useEffect( () => {
		if ( error ) {
			setError( 'root', {
				type: 'manual',
				message: translate( 'Something went wrong. Please try again.' ),
			} );
			logToLogstash( {
				message: 'Error submitting migration ticket',
				feature: 'calypso_client',
				extra: {
					siteSlug,
					step: 'site-migration-already-wpcom',
					from,
					error: error.message,
				},
			} );
		}
	}, [ error, setError, translate ] );

	useEffect( () => {
		if ( isSuccess ) {
			onComplete();
		}
	}, [ isSuccess, onComplete ] );

	const onSubmit = handleSubmit( ( data: TicketMigrationData ) => {
		if ( data.intents.length === 0 ) {
			setError( 'intents', {
				type: 'manual',
				message: translate( 'Please select an option.' ),
			} );
			return;
		}
		createTicket( {
			intents: data.intents,
			otherDetails: data.otherDetails,
		} );
	} );

	return (
		<div className="already-wpcom__form-container">
			<form className="already-wpcom__form" onSubmit={ onSubmit }>
				{ errorMessage && (
					<Notice
						status="is-warning"
						text={ errorMessage }
						showDismiss={ false }
						className="already-wpcom__form-error-notice"
					/>
				) }
				<div
					className={ clsx( 'already-wpcom__form-content', {
						'already-wpcom__form-content--error': errors.intents,
					} ) }
				>
					<div className="already-wpcom__form-title-container">
						<h4 className="already-wpcom__form-title">
							{ translate( 'What brought you here today?' ) }
						</h4>
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
				<NextButton disabled={ isPending } type="submit">
					{ translate( 'Continue' ) }
				</NextButton>
			</form>
		</div>
	);
};

export default Form;
