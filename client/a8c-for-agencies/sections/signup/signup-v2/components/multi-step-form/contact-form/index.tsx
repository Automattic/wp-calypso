import {
	Button,
	CheckboxControl,
	ExternalLink,
	Modal,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import {
	isDeniedNonUniqueDomain,
	isAgencyUrlExists,
} from 'calypso/a8c-for-agencies/components/form/utils';
import UserContactSupportModalForm from 'calypso/a8c-for-agencies/components/user-contact-support-modal-form';
import { AgencyDetailsSignupPayload } from 'calypso/a8c-for-agencies/sections/signup/types';
import QuerySmsCountries from 'calypso/components/data/query-countries/sms';
import FormPhoneInput from 'calypso/components/forms/form-phone-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useGetSupportedSMSCountries } from 'calypso/jetpack-cloud/sections/agency-dashboard/downtime-monitoring/contact-editor/hooks';
import { preventWidows } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import useContactFormValidation from './hooks/use-contact-form-validation';

import './style.scss';

type SignupContext = {
	is_automattician: boolean;
	is_proxied: boolean;
	non_unique_domains: string[];
};

function useSignupContext(): SignupContext | null {
	const [ context, setContext ] = useState< SignupContext | null >( null );

	useEffect( () => {
		wpcom.req
			.get( {
				path: '/agency/signup-context',
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( response: SignupContext ) => {
				setContext( response );
			} )
			.catch( () => {
				setContext( null );
			} );
	}, [] );

	return context;
}

type Props = {
	onContinue: ( data: Partial< AgencyDetailsSignupPayload > ) => void;
	initialFormData: Partial< AgencyDetailsSignupPayload >;
	withEmail?: boolean;
};

const SignupContactForm = ( { onContinue, initialFormData, withEmail = false }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { validate, validationError, updateValidationError } = useContactFormValidation( {
		withEmail,
	} );

	const [ isProcessing, setIsProceeding ] = useState( false );

	const countriesList = useGetSupportedSMSCountries();
	const noCountryList = countriesList.length === 0;

	const user = useSelector( getCurrentUser );
	const signupContext = useSignupContext();
	const showInternalFlags =
		signupContext?.is_automattician === true || signupContext?.is_proxied === true;
	const nonUniqueDomains = useMemo(
		() => new Set( signupContext?.non_unique_domains ?? [] ),
		[ signupContext?.non_unique_domains ]
	);

	const [ formData, setFormData ] = useState< Partial< AgencyDetailsSignupPayload > >( {
		firstName: initialFormData.firstName || '',
		lastName: initialFormData.lastName || '',
		email: initialFormData.email || '',
		agencyName: initialFormData.agencyName || '',
		agencyUrl: initialFormData.agencyUrl || '',
		phoneNumber: initialFormData.phoneNumber || '',
	} );

	const [ showDuplicateModal, setShowDuplicateModal ] = useState( false );
	const [ showSupportForm, setShowSupportForm ] = useState( false );
	const [ skipHubspot, setSkipHubspot ] = useState( true );

	// Track the phone input's country code so step 2 can auto-populate the
	// agency location when the user supplies a phone number.
	const [ phoneCountryCode, setPhoneCountryCode ] = useState( '' );

	const handlePhoneInputChange = ( data: {
		phoneNumber: string;
		phoneNumberFull: string;
		countryData?: { code: string };
	} ) => {
		setFormData( ( prev ) => ( {
			...prev,
			phoneNumber: data.phoneNumberFull,
		} ) );
		setPhoneCountryCode( data.phoneNumber && data.countryData?.code ? data.countryData.code : '' );
	};

	const dataToContinue: Partial< AgencyDetailsSignupPayload > = useMemo(
		() => ( phoneCountryCode ? { ...formData, country: phoneCountryCode } : formData ),
		[ formData, phoneCountryCode ]
	);

	const handleInputChange =
		( field: keyof AgencyDetailsSignupPayload ) =>
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			setFormData( ( prev ) => ( {
				...prev,
				[ field ]: event.target.value,
			} ) );
			updateValidationError( { [ field ]: undefined } );
		};

	const handleSubmit = useCallback(
		async ( e: React.FormEvent ) => {
			e.preventDefault();
			setIsProceeding( true );
			const error = await validate( formData );
			if ( error ) {
				setIsProceeding( false );
				return;
			}

			const agencyUrl = formData.agencyUrl ?? '';

			// Non-unique domains (gmail.com, facebook.com, etc.) can't produce
			// meaningful duplicate-agency matches, so skip the duplicate check
			// entirely and let the signup proceed.  Risk review still fires
			// independently based on the owner's email domain.
			if ( isDeniedNonUniqueDomain( agencyUrl, nonUniqueDomains ) ) {
				dispatch(
					recordTracksEvent( 'calypso_a4a_agency_signup_form_non_unique_domain_skipped', {
						agencyUrl,
					} )
				);
				setIsProceeding( false );
				onContinue( formData );
				return;
			}

			try {
				const duplicateURL = await isAgencyUrlExists( agencyUrl );

				if ( ! duplicateURL ) {
					onContinue( dataToContinue );
				} else {
					setShowDuplicateModal( true );
					dispatch(
						recordTracksEvent(
							'calypso_a4a_agency_signup_form_duplicate_agency_warning_dialog_view',
							{
								agencyUrl,
							}
						)
					);
				}
			} catch {
				// In case the verification fails, we just let the user continue with the form submission.
				onContinue( dataToContinue );
			} finally {
				setIsProceeding( false );
			}
		},
		[ validate, formData, dataToContinue, onContinue, dispatch, nonUniqueDomains ]
	);

	const closeDuplicateModal = useCallback( () => {
		setShowDuplicateModal( false );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_signup_form_duplicate_agency_warning_cancel_clicked' )
		);
	}, [ dispatch ] );

	const handleContactSupport = useCallback( () => {
		setShowDuplicateModal( false );
		setShowSupportForm( true );
		dispatch(
			recordTracksEvent( 'calypso_a4a_agency_signup_form_duplicate_agency_warning_support_clicked' )
		);
	}, [ dispatch ] );

	const handleBypass = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_agency_signup_form_internal_flags_bypass_clicked' ) );
		setShowDuplicateModal( false );
		onContinue( {
			...formData,
			bypass_duplicate_check: true,
			skip_hubspot: skipHubspot,
		} as Partial< AgencyDetailsSignupPayload > );
	}, [ dispatch, formData, onContinue, skipHubspot ] );

	const handleSkipHubspotToggle = useCallback(
		( checked: boolean ) => {
			setSkipHubspot( checked );
			dispatch(
				recordTracksEvent( 'calypso_a4a_agency_signup_form_internal_flags_skip_hubspot_toggled', {
					checked,
				} )
			);
		},
		[ dispatch ]
	);

	const supportFormEmail = withEmail ? formData.email : user?.email;
	const supportFormName = `${ formData.firstName ?? '' } ${ formData.lastName ?? '' }`.trim();
	const supportDefaultMessage = translate(
		'I tried to sign up for Automattic for Agencies with the agency name "%(agencyName)s" (%(agencyUrl)s) but was told my agency may already exist. I need help getting access.',
		{
			args: {
				agencyName: formData.agencyName ?? '',
				agencyUrl: formData.agencyUrl ?? '',
			},
		}
	);

	const getInternalFlagsReason = () => {
		if ( signupContext?.is_proxied && signupContext?.is_automattician ) {
			return translate(
				"You're seeing these options because you're proxied AND logged into an A11n-owned WordPress.com account."
			);
		}
		if ( signupContext?.is_proxied ) {
			return translate( "You're seeing these options because you're proxied." );
		}
		return translate(
			"You're seeing these options because you're logged into an A11n-owned WordPress.com account."
		);
	};

	return (
		<Form
			className="signup-contact-form"
			title={ preventWidows(
				translate( "Sign up and unlock the blueprint to grow your agency's business" )
			) }
			description={ preventWidows(
				translate(
					'Join 6000+ agencies and grow your business with {{span}}Automattic for Agencies.{{/span}} Get access to site management, earn commission on referrals, and explore our tier program to launch your business potential.',
					{
						components: {
							span: <span className="signup-contact-form__a4a-span" />,
						},
					}
				)
			) }
		>
			<div className="field-mandatory-message">
				{ translate( 'Fields marked with * are required' ) }
			</div>
			<div className="signup-multi-step-form__name-fields">
				<FormField
					error={ validationError.firstName }
					label={ translate( 'Your first name' ) }
					labelFor="firstName"
					isRequired
				>
					<FormTextInput
						id="firstName"
						name="firstName"
						value={ formData.firstName }
						onChange={ handleInputChange( 'firstName' ) }
						placeholder={ translate( 'Your first name' ) }
					/>
				</FormField>

				<FormField
					error={ validationError.lastName }
					label={ translate( 'Last name' ) }
					labelFor="lastName"
					isRequired
				>
					<FormTextInput
						id="lastName"
						name="lastName"
						value={ formData.lastName }
						onChange={ handleInputChange( 'lastName' ) }
						placeholder={ translate( 'Your last name' ) }
					/>
				</FormField>
			</div>

			{ withEmail && (
				<FormField
					error={ validationError.email }
					label={ translate( 'Email' ) }
					labelFor="email"
					isRequired
				>
					<FormTextInput
						id="email"
						name="email"
						type="email"
						value={ formData.email }
						onChange={ handleInputChange( 'email' ) }
						placeholder={ translate( 'Your email' ) }
					/>
				</FormField>
			) }

			<FormField
				error={ validationError.agencyName }
				label={ translate( 'Agency name' ) }
				labelFor="agencyName"
				isRequired
			>
				<FormTextInput
					id="agencyName"
					name="agencyName"
					value={ formData.agencyName }
					onChange={ handleInputChange( 'agencyName' ) }
					placeholder={ translate( 'Agency name' ) }
				/>
			</FormField>

			<FormField
				error={ validationError.agencyUrl }
				label={ translate( 'Business URL' ) }
				labelFor="agencyUrl"
				isRequired
			>
				<FormTextInput
					id="agencyUrl"
					name="agencyUrl"
					value={ formData.agencyUrl }
					onChange={ handleInputChange( 'agencyUrl' ) }
					placeholder={ translate( 'Business URL' ) }
				/>
			</FormField>

			{ noCountryList && <QuerySmsCountries /> }

			<FormPhoneInput
				isDisabled={ noCountryList }
				countriesList={ countriesList }
				onChange={ handlePhoneInputChange }
				className="contact-form__phone-input"
				phoneInputProps={ {
					id: 'phone_number',
					placeholder: translate( 'Phone number' ),
				} }
				countrySelectProps={ {
					id: 'country_code',
				} }
				initialCountryCode="US"
			/>

			<div className="signup-contact-form__tos">
				<p>
					{ translate(
						"By clicking 'Continue', you agree to the{{break}}{{/break}}{{link}}Terms of the Automattic for Agencies Platform Agreement{{/link}}",
						{
							components: {
								break: <br />,
								link: (
									<ExternalLink
										href="https://automattic.com/for-agencies/platform-agreement/"
										className="signup-contact-form__tos-link"
										children={ null }
									/>
								),
							},
						}
					) }
				</p>
			</div>

			<FormFooter>
				<Button
					__next40pxDefaultSize
					disabled={ isProcessing }
					variant="primary"
					onClick={ handleSubmit }
				>
					{ translate( 'Continue for free' ) }
				</Button>
			</FormFooter>

			{ showDuplicateModal && (
				<Modal
					isDismissible
					size="medium"
					onRequestClose={ closeDuplicateModal }
					title={ translate(
						'It looks like your agency may already be part of Automattic for Agencies.'
					) }
				>
					<VStack spacing={ 8 }>
						<Text>
							{ translate(
								"To get access, ask your agency owner to {{link}}invite you as a team member{{/link}}. If you're not sure who that is or need help, contact support.",
								{
									components: {
										link: (
											<a
												href="https://agencieshelp.automattic.com/knowledge-base/invite-team-members/"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</Text>

						{ showInternalFlags && (
							<div className="signup-contact-form__internal-flags">
								<Text>
									<strong>{ translate( 'Internal Flags' ) }</strong>
								</Text>
								<Text className="signup-contact-form__internal-flags-reason">
									<em>{ getInternalFlagsReason() }</em>
								</Text>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ translate( "Don't send this signup to HubSpot" ) }
									checked={ skipHubspot }
									onChange={ handleSkipHubspotToggle }
								/>
								<Button variant="secondary" onClick={ handleBypass }>
									{ translate( 'Bypass and create new agency anyway' ) }
								</Button>
							</div>
						) }

						<ButtonStack justify="flex-end">
							<Button variant="secondary" onClick={ closeDuplicateModal }>
								{ translate( 'Cancel' ) }
							</Button>
							<Button variant="primary" onClick={ handleContactSupport }>
								{ translate( 'Contact support' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</Modal>
			) }

			<UserContactSupportModalForm
				show={ showSupportForm }
				onClose={ () => setShowSupportForm( false ) }
				defaultMessage={ supportDefaultMessage as string }
				anonymousAtSignup={ {
					name: supportFormName,
					email: supportFormEmail ?? '',
					agencyName: formData.agencyName ?? '',
					agencyUrl: formData.agencyUrl ?? '',
				} }
			/>
		</Form>
	);
};

export default SignupContactForm;
