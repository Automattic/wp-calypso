import page from '@automattic/calypso-router';
import { Badge } from '@automattic/components';
import { Card, CardBody, ToggleControl, Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { Stat } from 'calypso/a8c-for-agencies/components/stat';
import useSubmitAgencyDetailsMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-agency-details';
import MinimumBudgetSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/minimum-budget-selector';
import ServiceLevelSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/service-level-selector';
import TokenFieldSelector from 'calypso/a8c-for-agencies/sections/partner-directory/components/token-field-selector';
import { useDispatch, useSelector } from 'calypso/state';
import {
	updateActiveAgencyAvailability,
	updateActiveAgencyLeadMatching,
} from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useFormSelectors } from '../components/hooks/use-form-selectors';
import LanguagesSelector from '../components/languages-selector';
import {
	PARTNER_DIRECTORY_DASHBOARD_SLUG,
	PARTNER_DIRECTORY_LEAD_MATCHING_SLUG,
} from '../constants';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from '../types';
import { mapAgencyDetailsFormData } from '../utils/map-application-form-data';
import useLeadMatchingForm from './hooks/use-lead-matching-form';
import useLeadMatchingFormValidation from './hooks/use-lead-matching-form-validation';
import useLeadMatchingSaveState from './hooks/use-lead-matching-save-state';
import useSubmitForm from './hooks/use-submit-form';

import './style.scss';

type Props = {
	initialFormData: LeadMatchingDetails | null;
	profile?: AgencyLeadMatchingProfile | null;
};

const REQUIRED_LEAD_MATCHING_FIELD_COUNT = 11;
const LEAD_MATCHING_ROUTE = `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_LEAD_MATCHING_SLUG }`;
const LEAD_MATCHING_STICKY_CARD_MIN_WIDTH = 660;
const REGIONS_AND_LANGUAGES_FIELDS = [ 'regions', 'languages' ] as const;
const BUSINESS_DETAILS_FIELDS = [ 'businessTypes', 'idealBusinessTypes', 'companySizes' ] as const;
const WEBSITE_NEEDS_AND_VISION_FIELDS = [ 'projectTypes', 'serviceLevels' ] as const;
const PROJECT_BUDGET_AND_TIMELINE_FIELDS = [ 'budgetLevels', 'timingPreferences' ] as const;
const DECISION_MAKING_FIELDS = [ 'decisionProcesses' ] as const;
const SITE_MANAGEMENT_FIELDS = [ 'ongoingRelationships' ] as const;
const REQUIRED_FIELDS_IN_ORDER = [
	'regions',
	'languages',
	'businessTypes',
	'idealBusinessTypes',
	'companySizes',
	'projectTypes',
	'serviceLevels',
	'budgetLevels',
	'timingPreferences',
	'decisionProcesses',
	'ongoingRelationships',
] as const;

const getCompletedRequiredFieldCount = ( formData: LeadMatchingDetails ) =>
	[
		formData.regions.length > 0,
		formData.languages.length > 0,
		formData.businessTypes.length > 0,
		formData.idealBusinessTypes.length > 0,
		formData.companySizes.length > 0,
		formData.projectTypes.length > 0,
		formData.serviceLevels.length > 0,
		formData.budgetLevels.length > 0,
		formData.timingPreferences.length > 0,
		formData.decisionProcesses.length > 0,
		formData.ongoingRelationships.length > 0,
	].filter( Boolean ).length;

let hasRegisteredLeadMatchingExitHook = false;
const leadMatchingExitSaveRef: { current: null | ( () => void ) } = { current: null };

const ensureLeadMatchingExitHook = () => {
	if ( hasRegisteredLeadMatchingExitHook ) {
		return;
	}

	page.exit( LEAD_MATCHING_ROUTE, ( _context, next ) => {
		leadMatchingExitSaveRef.current?.();
		next();
	} );
	hasRegisteredLeadMatchingExitHook = true;
};

const LeadMatchingForm = ( { initialFormData, profile }: Props ) => {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const persistedAvailability = agency?.profile.listing_details.is_available ?? true;
	const {
		availableRegions,
		availableBusinessTypes,
		availableCompanySizes,
		availableHostingEnvironments,
		availableMigrationPlatforms,
		availableStoreComplexities,
		availableProjectTypes,
		availableTimingPreferences,
		availableDecisionProcesses,
		availableOngoingRelationships,
		availableBudgetLevels,
	} = useFormSelectors();
	const { validate, validationError, updateValidationError } = useLeadMatchingFormValidation();
	const { formData, updateField: updateFormField } = useLeadMatchingForm( {
		agencyId: agency?.id,
		initialFormData,
	} );
	const { mutateAsync: submitAgencyDetails } = useSubmitAgencyDetailsMutation();
	const cardRef = useRef< HTMLDivElement >( null );
	const placeholderRef = useRef< HTMLDivElement >( null );
	const rafRef = useRef< number >( 0 );
	const lastStuckRef = useRef< boolean >( false );

	useEffect( () => {
		const scrollContainer = document.querySelector( '.hosting-dashboard-layout__body' );
		if ( ! scrollContainer || ! cardRef.current || ! placeholderRef.current ) {
			return;
		}

		const resetCardPosition = () => {
			if ( ! cardRef.current || ! placeholderRef.current ) {
				return;
			}

			placeholderRef.current.style.height = '';
			cardRef.current.style.position = '';
			cardRef.current.style.top = '';
			cardRef.current.style.left = '';
			cardRef.current.style.width = '';
			cardRef.current.classList.remove( 'is-stuck' );
			lastStuckRef.current = false;
		};

		const updatePosition = () => {
			if ( ! cardRef.current || ! placeholderRef.current ) {
				return;
			}

			if ( window.innerWidth < LEAD_MATCHING_STICKY_CARD_MIN_WIDTH ) {
				resetCardPosition();
				return;
			}

			placeholderRef.current.style.height = `${ cardRef.current.offsetHeight }px`;

			const placeholderRect = placeholderRef.current.getBoundingClientRect();
			const containerRect = scrollContainer.getBoundingClientRect();
			const shouldStick = placeholderRect.top < containerRect.top;

			if ( shouldStick !== lastStuckRef.current ) {
				lastStuckRef.current = shouldStick;

				if ( shouldStick ) {
					cardRef.current.style.position = 'fixed';
					cardRef.current.style.top = `${ containerRect.top }px`;
					cardRef.current.style.left = `${ placeholderRect.left }px`;
					cardRef.current.style.width = `${ placeholderRect.width }px`;
					cardRef.current.classList.add( 'is-stuck' );
				} else {
					cardRef.current.style.position = '';
					cardRef.current.style.top = '';
					cardRef.current.style.left = '';
					cardRef.current.style.width = '';
					cardRef.current.classList.remove( 'is-stuck' );
				}
			} else if ( shouldStick ) {
				cardRef.current.style.top = `${ containerRect.top }px`;
				cardRef.current.style.left = `${ placeholderRect.left }px`;
				cardRef.current.style.width = `${ placeholderRect.width }px`;
			}
		};

		const handleScroll = () => {
			if ( rafRef.current ) {
				cancelAnimationFrame( rafRef.current );
			}
			rafRef.current = requestAnimationFrame( updatePosition );
		};

		updatePosition();
		scrollContainer.addEventListener( 'scroll', handleScroll, { passive: true } );
		window.addEventListener( 'resize', handleScroll, { passive: true } );

		return () => {
			resetCardPosition();
			scrollContainer.removeEventListener( 'scroll', handleScroll );
			window.removeEventListener( 'resize', handleScroll );
			if ( rafRef.current ) {
				cancelAnimationFrame( rafRef.current );
			}
		};
	}, [] );

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_view' ) );
	}, [ dispatch ] );

	const [ hasSavedSuccessfully, setHasSavedSuccessfully ] = useState( false );
	const [ availabilityDraft, setAvailabilityDraft ] = useState< boolean | null >( null );
	const currentAvailability = availabilityDraft ?? persistedAvailability;

	useEffect( () => {
		setAvailabilityDraft( ( currentDraft ) =>
			currentDraft !== null && currentDraft === persistedAvailability ? null : currentDraft
		);
	}, [ persistedAvailability ] );

	const getSectionClassName = useCallback(
		( fields: ReadonlyArray< keyof typeof validationError > ) =>
			clsx( 'partner-directory-lead-matching__form-section', {
				'is-error': fields.some( ( field ) => Boolean( validationError[ field ] ) ),
			} ),
		[ validationError ]
	);

	const onSubmitSuccess = useCallback(
		( response: AgencyLeadMatchingResponse, { source }: { source: 'manual' | 'exit' } ) => {
			setHasSavedSuccessfully( true );
			dispatch(
				updateActiveAgencyLeadMatching( {
					draft: null,
					profile: response.lead_matching_profile,
					sync: response.sync,
				} )
			);

			dispatch(
				recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_submit_success', {
					agency_id: agency?.id,
					source,
				} )
			);

			if ( source === 'manual' ) {
				dispatch(
					successNotice( __( 'Your lead matching preferences were saved!' ), {
						displayOnNextPage: true,
						duration: 6000,
					} )
				);
				const scrollContainer = document.querySelector( '.hosting-dashboard-layout__body' );
				if ( scrollContainer ) {
					scrollContainer.scrollTo( { top: 0, behavior: 'smooth' } );
				}
			}
		},
		[ agency, dispatch ]
	);

	const onSubmitError = useCallback(
		( { source }: { source: 'manual' | 'exit' } ) => {
			dispatch(
				recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_submit_error', {
					agency_id: agency?.id,
					source,
				} )
			);
			if ( source === 'manual' ) {
				dispatch(
					errorNotice( __( 'Something went wrong saving your preferences.' ), {
						duration: 6000,
					} )
				);
			}
		},
		[ agency?.id, dispatch ]
	);

	const wasInitiallyComplete = useMemo( () => {
		if ( ! initialFormData ) {
			return false;
		}

		return getCompletedRequiredFieldCount( initialFormData ) === REQUIRED_LEAD_MATCHING_FIELD_COUNT;
	}, [ initialFormData ] );

	const completionStatus = useMemo( () => {
		const total = REQUIRED_LEAD_MATCHING_FIELD_COUNT;
		const completed = getCompletedRequiredFieldCount( formData );
		return { completed, total, isComplete: completed === total };
	}, [ formData ] );

	const { onSubmit, isSubmitting } = useSubmitForm( { onSubmitSuccess, onSubmitError } );
	const { saveStatus, hasUnsavedChanges, saveNow, saveOnExit } = useLeadMatchingSaveState( {
		formData,
		profile,
		acceptingWork: currentAvailability,
		onSubmit,
	} );
	const hasUnsavedAvailability = availabilityDraft !== null;
	const hasUnsavedState = hasUnsavedChanges || hasUnsavedAvailability;

	const updateField = useCallback(
		< K extends keyof LeadMatchingDetails >( field: K, value: LeadMatchingDetails[ K ] ) => {
			updateFormField( field, value );
		},
		[ updateFormField ]
	);

	const saveAvailability = useCallback(
		async ( source: 'manual' | 'exit' ) => {
			if ( ! agency || availabilityDraft === null ) {
				return true;
			}

			const agencyDetails = mapAgencyDetailsFormData( agency );
			if ( ! agencyDetails ) {
				return false;
			}

			try {
				await submitAgencyDetails( {
					...agencyDetails,
					isAvailable: currentAvailability,
				} );

				dispatch( updateActiveAgencyAvailability( currentAvailability ) );
				setAvailabilityDraft( null );

				return true;
			} catch {
				if ( source === 'manual' ) {
					dispatch(
						errorNotice( __( 'Something went wrong saving your availability.' ), {
							duration: 6000,
						} )
					);
				}
				return false;
			}
		},
		[ agency, availabilityDraft, currentAvailability, dispatch, submitAgencyDetails ]
	);

	const saveLeadMatchingPreferences = useCallback(
		async ( source: 'manual' | 'exit' ) => {
			const didSaveAvailability = await saveAvailability( source );

			if ( ! didSaveAvailability ) {
				return undefined;
			}

			const response = source === 'manual' ? await saveNow() : await saveOnExit();

			if ( source === 'manual' && hasUnsavedAvailability && ! hasUnsavedChanges ) {
				setHasSavedSuccessfully( true );
				dispatch(
					successNotice( __( 'Your lead matching preferences were saved!' ), {
						duration: 6000,
					} )
				);
			}

			return response;
		},
		[ dispatch, hasUnsavedAvailability, hasUnsavedChanges, saveAvailability, saveNow, saveOnExit ]
	);

	useEffect( () => {
		ensureLeadMatchingExitHook();

		if ( ! hasUnsavedState ) {
			leadMatchingExitSaveRef.current = null;
			return;
		}

		const handleRouteExit = () => {
			void saveLeadMatchingPreferences( 'exit' );
		};

		leadMatchingExitSaveRef.current = handleRouteExit;

		return () => {
			if ( leadMatchingExitSaveRef.current === handleRouteExit ) {
				leadMatchingExitSaveRef.current = null;
			}
		};
	}, [ hasUnsavedState, saveLeadMatchingPreferences ] );

	const eligibilityState = useMemo( () => {
		if ( ! currentAvailability ) {
			return 'not-accepting';
		}

		const hasSavedState = ( wasInitiallyComplete || hasSavedSuccessfully ) && ! hasUnsavedState;

		if ( hasSavedState && completionStatus.isComplete ) {
			return 'eligible';
		}
		if ( completionStatus.isComplete ) {
			return 'ready';
		}
		return 'in-progress';
	}, [
		completionStatus.isComplete,
		currentAvailability,
		hasSavedSuccessfully,
		hasUnsavedState,
		wasInitiallyComplete,
	] );

	const saveMessage = useMemo( () => {
		if ( hasUnsavedAvailability && ! hasUnsavedChanges ) {
			return __( 'Unsaved changes' );
		}

		switch ( saveStatus ) {
			case 'unsaved':
				return __( 'Unsaved changes' );
			case 'saving':
				return __( 'Saving…' );
			case 'saved':
				return __( 'Saved' );
			case 'error':
				return __( 'Couldn’t save changes' );
			default:
				return '';
		}
	}, [ hasUnsavedAvailability, hasUnsavedChanges, saveStatus ] );

	const saveStatusTone = useMemo( () => {
		if ( hasUnsavedAvailability && ! hasUnsavedChanges ) {
			return 'unsaved';
		}

		return saveStatus;
	}, [ hasUnsavedAvailability, hasUnsavedChanges, saveStatus ] );

	const getProgressStrapline = () => {
		const { completed, total } = completionStatus;

		if ( completed === 0 ) {
			return __( 'Answer all questions to start receiving leads' );
		}
		if ( completed <= 4 ) {
			/* translators: %(completed)d is the current completed question count and %(total)d is the total. */
			return sprintf( __( 'Question %(completed)d of %(total)d' ), {
				completed,
				total,
			} );
		}
		if ( completed <= 6 ) {
			/* translators: %(completed)d is the current completed question count and %(total)d is the total. */
			return sprintf( __( 'Halfway there! Question %(completed)d of %(total)d' ), {
				completed,
				total,
			} );
		}
		if ( completed <= 9 ) {
			/* translators: %(completed)d is the current completed question count and %(total)d is the total. */
			return sprintf( __( 'Almost done! Question %(completed)d of %(total)d' ), {
				completed,
				total,
			} );
		}
		return __( 'One more question to go!' );
	};

	/* translators: %(completed)d is the current completed question count and %(total)d is the total. */
	const progressMetric = sprintf( __( '%(completed)d of %(total)d' ), {
		completed: completionStatus.completed,
		total: completionStatus.total,
	} );

	const submitForm = () => {
		if ( hasUnsavedChanges ) {
			const error = validate( formData );
			if ( error ) {
				const firstInvalidField = REQUIRED_FIELDS_IN_ORDER.find( ( field ) => error[ field ] );
				if ( firstInvalidField ) {
					document
						.querySelector(
							`.partner-directory-lead-matching [data-field-name="${ firstInvalidField }"]`
						)
						?.scrollIntoView( {
							behavior: 'smooth',
							block: 'center',
						} );
				}
				return;
			}
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_partner_directory_lead_matching_submit', {
				agency_id: agency?.id,
				completed_fields: completionStatus.completed,
				total_fields: completionStatus.total,
			} )
		);
		void saveLeadMatchingPreferences( 'manual' );
	};

	return (
		<div className="partner-directory-lead-matching">
			<div ref={ placeholderRef } className="partner-directory-lead-matching__status-placeholder">
				<Card ref={ cardRef } className="partner-directory-lead-matching__status-card">
					<CardBody className="partner-directory-lead-matching__status-content">
						{ eligibilityState === 'eligible' && (
							<>
								<Badge type="success">{ __( 'Eligible for leads' ) }</Badge>
								<span className="partner-directory-lead-matching__status-text">
									{ __( 'Your preferences are saved. You can update them anytime.' ) }
								</span>
							</>
						) }
						{ eligibilityState === 'not-accepting' && (
							<>
								<Badge type="warning">{ __( 'Not eligible' ) }</Badge>
								<span className="partner-directory-lead-matching__status-text">
									{ __(
										'Turn on Accepting new clients to be included in lead matching and receive leads.'
									) }
								</span>
							</>
						) }
						{ eligibilityState === 'ready' && (
							<>
								<Badge type="info-blue">{ __( '1 step left' ) }</Badge>
								<span className="partner-directory-lead-matching__status-text">
									{ __(
										'All questions answered — click Update preferences to start receiving leads'
									) }
								</span>
							</>
						) }
						{ eligibilityState === 'in-progress' && (
							<Stat
								density="high"
								strapline={ getProgressStrapline() as string }
								metric={ String( progressMetric ) }
								progressValue={ ( completionStatus.completed / completionStatus.total ) * 100 }
							/>
						) }
					</CardBody>
				</Card>
			</div>

			<Form
				title={ __( 'Lead matching preferences' ) }
				autocomplete="off"
				description={ __(
					'Tell us about your agency & ideal client profile so we can match you with the best leads. All fields are required unless noted.'
				) }
			>
				<FormSection
					title={ __( "Your agency's availability" ) }
					className="partner-directory-lead-matching__form-section"
				>
					<FormField
						label={ __( 'Availability' ) }
						description={ __( 'Agencies not accepting new clients are not eligible for leads.' ) }
					>
						<ToggleControl
							checked={ currentAvailability }
							onChange={ ( value ) => {
								dispatch(
									recordTracksEvent(
										'calypso_a4a_partner_directory_lead_matching_availability_toggle',
										{
											agency_id: agency?.id,
											is_available: value,
										}
									)
								);
								setAvailabilityDraft( value === persistedAvailability ? null : value );
							} }
							label={ __( 'Accepting new clients' ) }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Regions and languages' ) }
					className={ getSectionClassName( REGIONS_AND_LANGUAGES_FIELDS ) }
				>
					<FormField
						label={ __( 'Which regions / time zones do you serve?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.regions }
						fieldName="regions"
					>
						<TokenFieldSelector
							availableOptions={ availableRegions }
							selectedSlugs={ formData.regions }
							onChange={ ( value ) => {
								updateField( 'regions', value );
								updateValidationError( { regions: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsGlobal }
							onChange={ ( value ) => updateField( 'supportsGlobal', value ) }
							label={ __( 'We support global / remote clients' ) }
						/>
					</div>

					<FormField
						label={ __( 'What languages does your agency support?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.languages }
						fieldName="languages"
					>
						<LanguagesSelector
							selectedLanguages={ formData.languages }
							setLanguages={ ( value ) => {
								updateField( 'languages', value as string[] );
								updateValidationError( { languages: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Business details' ) }
					className={ getSectionClassName( BUSINESS_DETAILS_FIELDS ) }
				>
					{ /* Keep the dormant Other text-field path disabled for now. `other` is a valid saved option. */ }
					<FormField
						label={ __( 'Which business types does your agency support?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.businessTypes }
						fieldName="businessTypes"
					>
						<TokenFieldSelector
							availableOptions={ availableBusinessTypes }
							selectedSlugs={ formData.businessTypes }
							onChange={ ( value ) => {
								updateField( 'businessTypes', value );
								updateValidationError( { businessTypes: undefined } );
							} }
							sortSuggestions
						/>
					</FormField>

					<FormField
						label={ __( 'Which business types are an ideal fit for your agency?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.idealBusinessTypes }
						fieldName="idealBusinessTypes"
					>
						<TokenFieldSelector
							availableOptions={ availableBusinessTypes }
							selectedSlugs={ formData.idealBusinessTypes }
							onChange={ ( value ) => {
								updateField( 'idealBusinessTypes', value );
								updateValidationError( { idealBusinessTypes: undefined } );
							} }
							sortSuggestions
						/>
					</FormField>

					<FormField
						label={ __( 'Which company sizes are a good fit for your agency?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.companySizes }
						fieldName="companySizes"
					>
						<TokenFieldSelector
							availableOptions={ availableCompanySizes }
							selectedSlugs={ formData.companySizes }
							onChange={ ( value ) => {
								updateField( 'companySizes', value );
								updateValidationError( { companySizes: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Hosting and platforms' ) }
					className="partner-directory-lead-matching__form-section"
				>
					<FormField
						label={ __( 'Which hosting environments do you regularly work with?' ) }
						description={ __( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<TokenFieldSelector
							availableOptions={ availableHostingEnvironments }
							selectedSlugs={ formData.hostingEnvironments }
							onChange={ ( value ) => updateField( 'hostingEnvironments', value ) }
							sortSuggestions
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsHostingRecommendation }
							onChange={ ( value ) => updateField( 'supportsHostingRecommendation', value ) }
							label={ __(
								'We are happy to recommend and move clients to better hosting when needed'
							) }
						/>
					</div>

					<FormField
						label={ __( 'What platforms does your agency typically migrate to WordPress?' ) }
						description={ __( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<TokenFieldSelector
							availableOptions={ availableMigrationPlatforms }
							selectedSlugs={ formData.migrationPlatforms }
							onChange={ ( value ) => updateField( 'migrationPlatforms', value ) }
							sortSuggestions
						/>
					</FormField>

					<FormField
						label={ __( 'Which store complexities can your agency support?' ) }
						description={ __( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<TokenFieldSelector
							availableOptions={ availableStoreComplexities }
							selectedSlugs={ formData.storeComplexities }
							onChange={ ( value ) => updateField( 'storeComplexities', value ) }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Website needs and vision' ) }
					className={ getSectionClassName( WEBSITE_NEEDS_AND_VISION_FIELDS ) }
				>
					<FormField
						label={ __( 'Which types of projects do you generally support?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.projectTypes }
						fieldName="projectTypes"
					>
						<TokenFieldSelector
							availableOptions={ availableProjectTypes }
							selectedSlugs={ formData.projectTypes }
							onChange={ ( value ) => {
								updateField( 'projectTypes', value );
								updateValidationError( { projectTypes: undefined } );
							} }
							sortSuggestions
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsQuickHelp }
							onChange={ ( value ) => updateField( 'supportsQuickHelp', value ) }
							label={ __( 'We accept one-off small fixes / `quick help` tickets' ) }
						/>
					</div>

					<FormField
						label={ __( 'Which max service level are you most comfortable with right now?' ) }
						description={ __( 'Choose the highest level your agency can realistically support.' ) }
						error={ validationError.serviceLevels }
						fieldName="serviceLevels"
					>
						<ServiceLevelSelector
							selectedServiceLevel={ formData.serviceLevels[ 0 ] ?? '' }
							setServiceLevel={ ( value ) => {
								updateField( 'serviceLevels', value ? [ value ] : [] );
								updateValidationError( { serviceLevels: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Project budget and timeline' ) }
					className={ getSectionClassName( PROJECT_BUDGET_AND_TIMELINE_FIELDS ) }
				>
					<FormField
						label={ __(
							'What budget levels are typically a good fit for new projects you take on?'
						) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.budgetLevels }
						fieldName="budgetLevels"
					>
						<TokenFieldSelector
							availableOptions={ availableBudgetLevels }
							selectedSlugs={ formData.budgetLevels }
							onChange={ ( value ) => {
								updateField( 'budgetLevels', value );
								updateValidationError( { budgetLevels: undefined } );
							} }
						/>
					</FormField>

					<FormField label={ __( 'What is your minimum budget?' ) } showOptionalLabel>
						<MinimumBudgetSelector
							selectedMinimumBudget={ formData.minimumBudget }
							setMinimumBudget={ ( value ) => updateField( 'minimumBudget', value ) }
						/>
					</FormField>

					<FormField
						label={ __( 'What client start timing works well for you right now?' ) }
						description={ __( 'Select all that apply and adjust as often as you need to.' ) }
						error={ validationError.timingPreferences }
						fieldName="timingPreferences"
					>
						<TokenFieldSelector
							availableOptions={ availableTimingPreferences }
							selectedSlugs={ formData.timingPreferences }
							onChange={ ( value ) => {
								updateField( 'timingPreferences', value );
								updateValidationError( { timingPreferences: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsHardDeadlines }
							onChange={ ( value ) => updateField( 'supportsHardDeadlines', value ) }
							label={ __(
								'We can accommodate hard deadlines (events, campaigns, etc.) when needed'
							) }
						/>
					</div>
				</FormSection>

				<FormSection
					title={ __( 'Decision making' ) }
					className={ getSectionClassName( DECISION_MAKING_FIELDS ) }
				>
					<FormField
						label={ __( 'What types of decision-making processes do you work well with?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.decisionProcesses }
						fieldName="decisionProcesses"
					>
						<TokenFieldSelector
							availableOptions={ availableDecisionProcesses }
							selectedSlugs={ formData.decisionProcesses }
							onChange={ ( value ) => {
								updateField( 'decisionProcesses', value );
								updateValidationError( { decisionProcesses: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				<FormSection
					title={ __( 'Site management' ) }
					className={ getSectionClassName( SITE_MANAGEMENT_FIELDS ) }
				>
					<FormField
						label={ __( 'What ongoing relationship do you support?' ) }
						description={ __( 'Select all that apply.' ) }
						error={ validationError.ongoingRelationships }
						fieldName="ongoingRelationships"
					>
						<TokenFieldSelector
							availableOptions={ availableOngoingRelationships }
							selectedSlugs={ formData.ongoingRelationships }
							onChange={ ( value ) => {
								updateField( 'ongoingRelationships', value );
								updateValidationError( { ongoingRelationships: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.requiresMaintenance }
							onChange={ ( value ) => updateField( 'requiresMaintenance', value ) }
							label={ __( 'We require an ongoing maintenance plan for most builds' ) }
						/>
					</div>
				</FormSection>

				<div className="partner-directory-agency-cta__footer">
					{ saveMessage && (
						<span
							className={ `partner-directory-lead-matching__save-status is-${ saveStatusTone }` }
						>
							{ saveMessage }
						</span>
					) }

					<Button
						__next40pxDefaultSize
						variant="secondary"
						href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }` }
						disabled={ isSubmitting }
					>
						{ __( 'Cancel' ) }
					</Button>

					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ submitForm }
						disabled={ isSubmitting }
					>
						{ initialFormData ? __( 'Update preferences' ) : __( 'Save preferences' ) }
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default LeadMatchingForm;
