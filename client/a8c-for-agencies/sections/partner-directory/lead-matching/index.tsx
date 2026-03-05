import { Badge, Button } from '@automattic/components';
import { TextControl, ToggleControl, Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormField from 'calypso/a8c-for-agencies/components/form/field';
import validateNonEmpty from 'calypso/a8c-for-agencies/components/form/hoc/with-error-handling/validators/non-empty';
import FormSection from 'calypso/a8c-for-agencies/components/form/section';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { Stat } from 'calypso/dashboard/components/stat';
import { useDispatch } from 'calypso/state';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import BudgetLevelsSelector from '../components/budget-levels-selector';
import BusinessTypesSelector from '../components/business-types-selector';
import CompanySizesSelector from '../components/company-sizes-selector';
import DecisionProcessesSelector from '../components/decision-processes-selector';
import HostingEnvironmentsSelector from '../components/hosting-environments-selector';
import IdealBusinessTypesSelector from '../components/ideal-business-types-selector';
import LanguagesSelector from '../components/languages-selector';
import MigrationPlatformsSelector from '../components/migration-platforms-selector';
import MinimumBudgetSelector from '../components/minimum-budget-selector';
import OngoingRelationshipSelector from '../components/ongoing-relationship-selector';
import ProjectTypesSelector from '../components/project-types-selector';
import RegionsSelector from '../components/regions-selector';
import ServiceLevelsSelector from '../components/service-levels-selector';
import StoreComplexitiesSelector from '../components/store-complexities-selector';
import TimingPreferencesSelector from '../components/timing-preferences-selector';
import { PARTNER_DIRECTORY_DASHBOARD_SLUG } from '../constants';
import { LeadMatchingDetails } from '../types';
import { getCompletionOverride, getEligibilityStateOverride } from './hooks/use-dev-test-overrides';
import useLeadMatchingForm from './hooks/use-lead-matching-form';
import useLeadMatchingFormValidation from './hooks/use-lead-matching-form-validation';
import useSubmitForm from './hooks/use-submit-form';

import './style.scss';

type Props = {
	initialFormData: LeadMatchingDetails | null;
};

const LeadMatchingForm = ( { initialFormData }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { validate, validationError, updateValidationError } = useLeadMatchingFormValidation();

	// Sticky card with fixed positioning when scrolled
	const cardRef = useRef< HTMLDivElement >( null );
	const placeholderRef = useRef< HTMLDivElement >( null );
	const rafRef = useRef< number >( 0 );
	const lastStuckRef = useRef< boolean >( false );
	const cardHeightRef = useRef< number >( 0 );

	useEffect( () => {
		const scrollContainer = document.querySelector( '.hosting-dashboard-layout__body' );
		if ( ! scrollContainer || ! cardRef.current || ! placeholderRef.current ) {
			return;
		}

		// Measure and lock the placeholder height immediately
		const cardHeight = cardRef.current.offsetHeight;
		cardHeightRef.current = cardHeight;
		placeholderRef.current.style.height = `${ cardHeight }px`;

		const updatePosition = () => {
			if ( ! cardRef.current || ! placeholderRef.current ) {
				return;
			}

			const placeholderRect = placeholderRef.current.getBoundingClientRect();
			const containerRect = scrollContainer.getBoundingClientRect();
			const shouldStick = placeholderRect.top < containerRect.top;

			// Only update DOM if state changed
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
				// Update position while stuck (in case of resize)
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

		scrollContainer.addEventListener( 'scroll', handleScroll, { passive: true } );
		window.addEventListener( 'resize', handleScroll, { passive: true } );

		return () => {
			scrollContainer.removeEventListener( 'scroll', handleScroll );
			window.removeEventListener( 'resize', handleScroll );
			if ( rafRef.current ) {
				cancelAnimationFrame( rafRef.current );
			}
		};
	}, [] );

	const [ hasSavedSuccessfully, setHasSavedSuccessfully ] = useState( false );

	const onSubmitSuccess = useCallback(
		( response: Agency ) => {
			if ( response ) {
				setHasSavedSuccessfully( true );
				dispatch(
					successNotice( translate( 'Your lead matching preferences were saved!' ), {
						duration: 6000,
					} )
				);
				// Scroll to top to show the updated status
				const scrollContainer = document.querySelector( '.hosting-dashboard-layout__body' );
				if ( scrollContainer ) {
					scrollContainer.scrollTo( { top: 0, behavior: 'smooth' } );
				}
			}
		},
		[ translate, dispatch ]
	);

	const onSubmitError = useCallback( () => {
		dispatch(
			errorNotice( translate( 'Something went wrong saving your preferences.' ), {
				duration: 6000,
			} )
		);
	}, [ translate, dispatch ] );

	const { formData, updateField } = useLeadMatchingForm( { initialFormData } );

	const { onSubmit, isSubmitting } = useSubmitForm( {
		formData,
		onSubmitSuccess,
		onSubmitError,
	} );

	// Check if initial data was already complete (saved & eligible)
	const wasInitiallyComplete = useMemo( () => {
		if ( ! initialFormData ) {
			return false;
		}
		return (
			initialFormData.regions.length > 0 &&
			initialFormData.languages.length > 0 &&
			initialFormData.businessTypes.length > 0 &&
			initialFormData.idealBusinessTypes.length > 0 &&
			initialFormData.companySizes.length > 0 &&
			initialFormData.projectTypes.length > 0 &&
			initialFormData.serviceLevels.length > 0 &&
			initialFormData.budgetLevels.length > 0 &&
			initialFormData.timingPreferences.length > 0 &&
			initialFormData.decisionProcesses.length > 0 &&
			initialFormData.ongoingRelationships.length > 0
		);
	}, [ initialFormData ] );

	// Count completed required fields
	const completionStatus = useMemo( () => {
		const requiredFields = [
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
		];
		const total = requiredFields.length;

		// DEV: Check for URL override
		const completedOverride = getCompletionOverride( total );
		if ( completedOverride !== null ) {
			return { completed: completedOverride, total, isComplete: completedOverride === total };
		}

		const completed = requiredFields.filter( Boolean ).length;
		return { completed, total, isComplete: completed === total };
	}, [ formData ] );

	// Determine the eligibility state:
	// 1. 'eligible' - saved with all required fields complete
	// 2. 'ready' - all fields complete but not yet saved
	// 3. 'in-progress' - still filling out required fields
	const eligibilityState = useMemo( () => {
		// DEV: Check for URL override
		const stateOverride = getEligibilityStateOverride();
		if ( stateOverride ) {
			return stateOverride;
		}

		if ( ( wasInitiallyComplete || hasSavedSuccessfully ) && completionStatus.isComplete ) {
			return 'eligible';
		}
		if ( completionStatus.isComplete ) {
			return 'ready';
		}
		return 'in-progress';
	}, [ wasInitiallyComplete, hasSavedSuccessfully, completionStatus.isComplete ] );

	// Get strapline with progressive encouragement based on progress
	const getProgressStrapline = () => {
		const { completed, total } = completionStatus;

		if ( completed === 0 ) {
			return translate( 'Answer all questions to start receiving leads' );
		}
		if ( completed <= 4 ) {
			return translate( 'Question %(completed)d of %(total)d', {
				args: { completed, total },
			} );
		}
		if ( completed <= 6 ) {
			return translate( 'Halfway there! Question %(completed)d of %(total)d', {
				args: { completed, total },
			} );
		}
		if ( completed <= 9 ) {
			return translate( 'Almost done! Question %(completed)d of %(total)d', {
				args: { completed, total },
			} );
		}
		return translate( 'One more question to go!' );
	};

	const submitForm = () => {
		const error = validate( formData );
		if ( error ) {
			const parent = document.getElementsByClassName( 'partner-directory__body' )?.[ 0 ];
			if ( parent ) {
				parent?.scrollTo( { behavior: 'smooth', top: 0 } );
			}
			return;
		}
		onSubmit();
	};

	// Check if "other" is selected in business types to show text field
	const showOtherBusinessType = formData.businessTypes.includes( 'other' );
	const showOtherIdealBusinessType = formData.idealBusinessTypes.includes( 'other' );

	return (
		<div className="partner-directory-lead-matching">
			<div ref={ placeholderRef } className="partner-directory-lead-matching__status-placeholder">
				<Card ref={ cardRef } className="partner-directory-lead-matching__status-card">
					<CardBody className="partner-directory-lead-matching__status-content">
						{ eligibilityState === 'eligible' && (
							<>
								<Badge type="success">{ translate( 'Eligible for leads' ) }</Badge>
								<span className="partner-directory-lead-matching__status-text">
									{ translate( 'Your preferences are saved. You can update them anytime.' ) }
								</span>
							</>
						) }
						{ eligibilityState === 'ready' && (
							<>
								<Badge type="info-blue">{ translate( '1 step left' ) }</Badge>
								<span className="partner-directory-lead-matching__status-text">
									{ translate(
										'All questions answered — click Save preferences to start receiving leads'
									) }
								</span>
							</>
						) }
						{ eligibilityState === 'in-progress' && (
							<Stat
								density="high"
								strapline={ getProgressStrapline() as string }
								metric={ String(
									translate( '%(completed)d of %(total)d', {
										args: {
											completed: completionStatus.completed,
											total: completionStatus.total,
										},
									} )
								) }
								description={ translate( 'questions answered' ) as string }
								progressValue={ ( completionStatus.completed / completionStatus.total ) * 100 }
							/>
						) }
					</CardBody>
				</Card>
			</div>
			<Form
				title={ translate( 'Lead matching preferences' ) }
				autocomplete="off"
				description={ translate(
					'Help us match you with the right leads by specifying your ideal client criteria.'
				) }
			>
				{ /* Regions & languages - P2 spec: Contact info section */ }
				<FormSection title={ translate( 'Regions and languages' ) }>
					<FormField
						label={ translate( 'Which regions / time zones do you serve?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.regions }
						field={ formData.regions }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<RegionsSelector
							selectedRegions={ formData.regions }
							setRegions={ ( value ) => {
								updateField( 'regions', value );
								updateValidationError( { regions: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsGlobal }
							onChange={ ( value ) => updateField( 'supportsGlobal', value ) }
							label={ translate( 'We support global / remote clients' ) }
						/>
					</div>

					<FormField
						label={ translate( 'What languages does your agency support?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.languages }
						field={ formData.languages }
						checks={ [ validateNonEmpty() ] }
						isRequired
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

				{ /* Business details - P2 spec: Client types section */ }
				<FormSection title={ translate( 'Business details' ) }>
					<FormField
						label={ translate( 'Which business types does your agency support?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.businessTypes }
						field={ formData.businessTypes }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<BusinessTypesSelector
							selectedBusinessTypes={ formData.businessTypes }
							setBusinessTypes={ ( value ) => {
								updateField( 'businessTypes', value );
								updateValidationError( { businessTypes: undefined } );
							} }
						/>
					</FormField>

					{ showOtherBusinessType && (
						<FormField label={ translate( 'Please specify other business type' ) }>
							<TextControl
								value={ formData.otherBusinessType }
								onChange={ ( value ) => updateField( 'otherBusinessType', value ) }
								placeholder={ translate( 'Describe the other business type' ) }
							/>
						</FormField>
					) }

					<FormField
						label={ translate( 'Which business types are an ideal fit for your agency?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.idealBusinessTypes }
						field={ formData.idealBusinessTypes }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<IdealBusinessTypesSelector
							selectedIdealBusinessTypes={ formData.idealBusinessTypes }
							setIdealBusinessTypes={ ( value ) => {
								updateField( 'idealBusinessTypes', value );
								updateValidationError( { idealBusinessTypes: undefined } );
							} }
						/>
					</FormField>

					{ showOtherIdealBusinessType && (
						<FormField label={ translate( 'Please specify other ideal business type' ) }>
							<TextControl
								value={ formData.otherIdealBusinessType }
								onChange={ ( value ) => updateField( 'otherIdealBusinessType', value ) }
								placeholder={ translate( 'Describe the other ideal business type' ) }
							/>
						</FormField>
					) }

					<FormField
						label={ translate( 'Which company sizes are a good fit for your agency?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.companySizes }
						field={ formData.companySizes }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<CompanySizesSelector
							selectedCompanySizes={ formData.companySizes }
							setCompanySizes={ ( value ) => {
								updateField( 'companySizes', value );
								updateValidationError( { companySizes: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				{ /* Current website - P2 spec: Technical environment section */ }
				<FormSection title={ translate( 'Current website' ) }>
					<FormField
						label={ translate( 'Which hosting environments do you regularly work with?' ) }
						description={ translate( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<HostingEnvironmentsSelector
							selectedHostingEnvironments={ formData.hostingEnvironments }
							setHostingEnvironments={ ( value ) => updateField( 'hostingEnvironments', value ) }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsHostingRecommendation }
							onChange={ ( value ) => updateField( 'supportsHostingRecommendation', value ) }
							label={ translate(
								'We are happy to recommend and move clients to better hosting when needed'
							) }
						/>
					</div>

					<FormField
						label={ translate( 'What platforms does your agency typically migrate to WordPress?' ) }
						description={ translate( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<MigrationPlatformsSelector
							selectedMigrationPlatforms={ formData.migrationPlatforms }
							setMigrationPlatforms={ ( value ) => updateField( 'migrationPlatforms', value ) }
						/>
					</FormField>

					<FormField
						label={ translate( 'Which store complexities can your agency support?' ) }
						description={ translate( 'Select all that apply.' ) }
						showOptionalLabel
					>
						<StoreComplexitiesSelector
							selectedStoreComplexities={ formData.storeComplexities }
							setStoreComplexities={ ( value ) => updateField( 'storeComplexities', value ) }
						/>
					</FormField>
				</FormSection>

				{ /* Website needs and vision - P2 spec: Project types section */ }
				<FormSection title={ translate( 'Website needs and vision' ) }>
					<FormField
						label={ translate( 'Which types of projects do you generally support?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.projectTypes }
						field={ formData.projectTypes }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<ProjectTypesSelector
							selectedProjectTypes={ formData.projectTypes }
							setProjectTypes={ ( value ) => {
								updateField( 'projectTypes', value );
								updateValidationError( { projectTypes: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsQuickHelp }
							onChange={ ( value ) => updateField( 'supportsQuickHelp', value ) }
							label={ translate( 'We accept one-off small fixes / "quick help" tickets' ) }
						/>
					</div>

					<FormField
						label={ translate(
							'Which max service level are you most comfortable with right now?'
						) }
						description={ translate(
							'Choose the highest level your agency can realistically support.'
						) }
						error={ validationError.serviceLevels }
						field={ formData.serviceLevels }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<ServiceLevelsSelector
							selectedServiceLevels={ formData.serviceLevels }
							setServiceLevels={ ( value ) => {
								updateField( 'serviceLevels', value );
								updateValidationError( { serviceLevels: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				{ /* Project budget & timeline - P2 spec */ }
				<FormSection title={ translate( 'Project budget and timeline' ) }>
					<FormField
						label={ translate(
							'What budget levels are typically a good fit for new projects you take on?'
						) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.budgetLevels }
						field={ formData.budgetLevels }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<BudgetLevelsSelector
							selectedBudgetLevels={ formData.budgetLevels }
							setBudgetLevels={ ( value ) => {
								updateField( 'budgetLevels', value );
								updateValidationError( { budgetLevels: undefined } );
							} }
						/>
					</FormField>

					<FormField label={ translate( 'What is your minimum budget?' ) } showOptionalLabel>
						<MinimumBudgetSelector
							selectedMinimumBudget={ formData.minimumBudget }
							setMinimumBudget={ ( value ) => updateField( 'minimumBudget', value ) }
						/>
					</FormField>

					<FormField
						label={ translate( 'What client start timing works well for you right now?' ) }
						description={ translate( 'Select all that apply and adjust as often as you need to.' ) }
						error={ validationError.timingPreferences }
						field={ formData.timingPreferences }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<TimingPreferencesSelector
							selectedTimingPreferences={ formData.timingPreferences }
							setTimingPreferences={ ( value ) => {
								updateField( 'timingPreferences', value );
								updateValidationError( { timingPreferences: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.supportsHardDeadlines }
							onChange={ ( value ) => updateField( 'supportsHardDeadlines', value ) }
							label={ translate(
								'We can accommodate hard deadlines (events, campaigns, etc.) when needed'
							) }
						/>
					</div>
				</FormSection>

				{ /* Decision making - P2 spec */ }
				<FormSection title={ translate( 'Decision making' ) }>
					<FormField
						label={ translate( 'What types of decision-making processes do you work well with?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.decisionProcesses }
						field={ formData.decisionProcesses }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<DecisionProcessesSelector
							selectedDecisionProcesses={ formData.decisionProcesses }
							setDecisionProcesses={ ( value ) => {
								updateField( 'decisionProcesses', value );
								updateValidationError( { decisionProcesses: undefined } );
							} }
						/>
					</FormField>
				</FormSection>

				{ /* Site management - P2 spec: Ongoing support section */ }
				<FormSection title={ translate( 'Site management' ) }>
					<FormField
						label={ translate( 'What ongoing relationship do you support?' ) }
						description={ translate( 'Select all that apply.' ) }
						error={ validationError.ongoingRelationships }
						field={ formData.ongoingRelationships }
						checks={ [ validateNonEmpty() ] }
						isRequired
					>
						<OngoingRelationshipSelector
							selectedOngoingRelationships={ formData.ongoingRelationships }
							setOngoingRelationships={ ( value ) => {
								updateField( 'ongoingRelationships', value );
								updateValidationError( { ongoingRelationships: undefined } );
							} }
						/>
					</FormField>

					<div className="partner-directory-lead-matching__toggle-field">
						<ToggleControl
							checked={ formData.requiresMaintenance }
							onChange={ ( value ) => updateField( 'requiresMaintenance', value ) }
							label={ translate( 'We require an ongoing maintenance plan for most builds' ) }
						/>
					</div>
				</FormSection>

				<div className="partner-directory-agency-cta__required-information">
					{ translate( '* indicates a required field' ) }
				</div>

				<div className="partner-directory-agency-cta__footer">
					<Button
						href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }` }
						disabled={ isSubmitting }
					>
						{ translate( 'Cancel' ) }
					</Button>

					<Button primary onClick={ submitForm } disabled={ isSubmitting }>
						{ initialFormData
							? translate( 'Update preferences' )
							: translate( 'Save preferences' ) }
					</Button>
				</div>
			</Form>
		</div>
	);
};

export default LeadMatchingForm;
