import { FormLabel } from '@automattic/components';
import { NextButton } from '@automattic/onboarding';
import { CheckboxControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC, useCallback, useEffect } from 'react';
import { Control, Controller, FieldError, useForm } from 'react-hook-form';
import FormTextArea from 'calypso/components/forms/form-textarea';
import Notice from 'calypso/components/notice';
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
					{ ...field }
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
							{ ...field }
							value={ field.value }
							onChange={ field.onChange }
							placeholder={ translate(
								'Share any other details that will help us figure out what we need to do next.'
							) }
							className={ clsx( 'site-migration-already-wpcom__form-textarea', {
								'site-migration-already-wpcom__form-textarea--error': error,
							} ) }
						/>
						{ error && error.message && (
							<p className="site-migration-already-wpcom__form-error">{ error.message }</p>
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

	useEffect( () => {
		if ( error ) {
			setError( 'root', {
				type: 'manual',
				message: translate( 'Something went wrong. Please try again.' ),
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

	const intents = watch( 'intents' );
	const isOtherChecked = intents.includes( 'other' );

	const getErrorMessage = useCallback( () => {
		if ( errors?.root?.message ) {
			return errors.root.message;
		}
		if ( errors?.intents?.message ) {
			return errors.intents.message;
		}
		return null;
	}, [ errors ] );

	return (
		<div className="site-migration-already-wpcom__form-container">
			<form className="site-migration-already-wpcom__form" onSubmit={ onSubmit }>
				{ getErrorMessage() && (
					<Notice
						showIcon={ false }
						status="is-warning"
						text={ getErrorMessage() }
						showDismiss={ false }
						className="site-migration-already-wpcom__form-error-notice"
					/>
				) }
				<div
					className={ clsx( 'site-migration-already-wpcom__form-content', {
						'site-migration-already-wpcom__form-content--error': errors.intents,
					} ) }
				>
					<div className="site-migration-already-wpcom__form-title-container">
						<h4 className="site-migration-already-wpcom__form-title">
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
