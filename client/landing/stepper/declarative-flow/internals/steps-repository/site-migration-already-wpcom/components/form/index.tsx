import { FormLabel } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useState } from 'react';
import { Control, Controller, FieldError, RegisterOptions, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import FormTextArea from 'calypso/components/forms/form-textarea';
import Notice from 'calypso/components/notice';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { logToLogstash } from 'calypso/lib/logstash';
import {
	type TicketMigrationData,
	useMigrationTicketMutation,
} from '../../hooks/use-migration-ticket-mutation';
interface CheckboxProps {
	label: string;
	control: Control< TicketMigrationData >;
	value: string;
	rules?: RegisterOptions< TicketMigrationData, 'intents' >;
}

const CheckboxIntents = ( { label, control, value, rules }: CheckboxProps ) => (
	<Controller
		control={ control }
		name="intents"
		rules={ rules }
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

const extractDomainFromUrl = ( url: string ) => {
	try {
		const parsedUrl = new URL( url );
		return parsedUrl.hostname;
	} catch {
		return url;
	}
};

const Form: FC< FormProps > = ( { onComplete } ) => {
	const translate = useTranslate();
	const locale = useLocale();
	const siteSlug = useSiteSlugParam();
	const [ queryParams ] = useSearchParams();
	const from = queryParams.get( 'from' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	// Use the destination siteSlug if available, otherwise extract domain from the source wpcom site URL
	const targetSiteSlug = siteSlug || ( from ? extractDomainFromUrl( from ) : '' );

	const { sendTicketAsync: createZendeskTicket } = useSubmitMigrationTicket();
	const { mutateAsync: createSurveyTicket } = useMigrationTicketMutation( targetSiteSlug );

	const {
		control,
		handleSubmit,
		watch,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm< TicketMigrationData >( {
		disabled: isSubmitting,
		defaultValues: {
			intents: [],
			otherDetails: '',
		},
	} );
	const intents = watch( 'intents' );
	const isOtherChecked = intents.includes( 'other' );
	const errorMessage = errors?.root?.message ?? errors?.intents?.message;

	const onSubmit = handleSubmit( async ( data: TicketMigrationData ) => {
		clearErrors( 'root' );

		if ( ! targetSiteSlug ) {
			setError( 'root', {
				type: 'manual',
				message: translate( 'Something went wrong. Please try again.' ),
			} );
			logToLogstash( {
				message: 'Missing targetSiteSlug in migration survey submission',
				feature: 'calypso_client',
				extra: {
					step: 'site-migration-already-wpcom',
					siteSlug: siteSlug ?? '',
					from: from ?? '',
				},
			} );
			return;
		}

		setIsSubmitting( true );

		try {
			// Create ZenDesk ticket (required before survey can be submitted)
			await createZendeskTicket( {
				locale,
				from_url: from ?? '',
				blog_url: targetSiteSlug,
			} );

			// Submit survey
			await createSurveyTicket( {
				intents: data.intents,
				otherDetails: data.otherDetails,
			} );

			onComplete();
		} catch ( submitError ) {
			setError( 'root', {
				type: 'manual',
				message: translate( 'Something went wrong. Please try again.' ),
			} );
			logToLogstash( {
				message: 'Error submitting migration survey',
				feature: 'calypso_client',
				extra: {
					siteSlug: targetSiteSlug,
					step: 'site-migration-already-wpcom',
					from,
					error: submitError instanceof Error ? submitError.message : String( submitError ),
				},
			} );
		} finally {
			setIsSubmitting( false );
		}
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
						rules={ {
							validate: ( value: string[] ) =>
								value.length > 0 || translate( 'Please select an option.' ),
						} }
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
				<NextButton disabled={ isSubmitting } type="submit">
					{ translate( 'Continue' ) }
				</NextButton>
			</form>
		</div>
	);
};

export default Form;
