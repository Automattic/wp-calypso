import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	updateSiteInfoCurrentSectionID,
	updateSiteInfoValues,
} from 'calypso/state/signup/steps/site-info-collection/actions';
import {
	SectionsTouchedInfo,
	SITE_INFO_SECTIONS,
	SiteInfo,
} from 'calypso/state/signup/steps/site-info-collection/schema';
import {
	getSiteInfoCollectionData,
	getSiteInfoCollectionOpenedSection,
	getSiteInfoCollectionTouchedStates,
} from 'calypso/state/signup/steps/site-info-collection/selectors';
import { AccordionForm } from './accordion-form';
import AccordionFormSection from './accordion-form-section';
import { ContactInformation, TextInputField, SocialMediaProfiles } from './form-components';
import { validateSection, validateAll, ErrorMap } from './site-info-validators';
import './style.scss';

interface SiteInformationCollectionProps {
	additionalStepData: object;
	stepName: string;
	submitSignupStep: ( step: { stepName: string }, formValues: SiteInfo ) => void;
	goToNextStep: () => void;
}

function SiteInformationCollection( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
}: SiteInformationCollectionProps ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const siteInfoCollectionDataFromStore: SiteInfo = useSelector( getSiteInfoCollectionData );
	const initialOpenSectionId: string = useSelector( getSiteInfoCollectionOpenedSection );
	const touchedStates: SectionsTouchedInfo = useSelector( getSiteInfoCollectionTouchedStates );
	// Initialize local state with the values from the redux store
	const [ formValues, setFormValues ] = useState< SiteInfo >( siteInfoCollectionDataFromStore );
	const [ formErrors, setFormErrors ] = useState< ErrorMap >( {} );

	const onChangeField = ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => {
		const validationResult = validateAll( formValues );
		setFormErrors( validationResult.detailedErrors );
		setFormValues( {
			...formValues,
			[ name ]: value,
		} );
	};

	const saveFormState = ( openSectionId?: string ) => {
		dispatch( updateSiteInfoValues( formValues ) );
		if ( openSectionId ) {
			dispatch( updateSiteInfoCurrentSectionID( openSectionId ) );
		}
	};

	const onSubmit = () => {
		saveFormState();
		const validationResult = validateAll( formValues );
		setFormErrors( validationResult.detailedErrors );
		if ( validationResult.isValid ) {
			const step = {
				stepName,
				...additionalStepData,
			};
			submitSignupStep( step, {
				...formValues,
			} );
			goToNextStep();
		}
		// Handle focus when submit failed
	};

	return (
		<AccordionForm
			initialOpenSectionId={ initialOpenSectionId }
			isGoToNextAllowed={ ( sectionID ) => {
				const validationResult = validateSection( sectionID as keyof typeof SITE_INFO_SECTIONS )(
					formValues
				);
				setFormErrors( {
					...formErrors,
					...validationResult.detailedErrors,
				} );
				return validationResult.isValid;
			} }
			onNextCallback={ saveFormState }
			onOpenCallback={ saveFormState }
			onSubmit={ onSubmit }
		>
			<AccordionFormSection
				sectionId={ SITE_INFO_SECTIONS.siteTitle }
				title={ translate( '%d. Name of your business', {
					args: [ 1 ],
					comment: 'This is the serial number: 1',
				} ) }
				summary={ formValues.siteTitle }
				showSkip={ false }
				isTouched={ touchedStates.siteTitle }
			>
				<TextInputField
					label={ translate(
						'Please enter the name of your business as you want it to appear on your new site.'
					) }
					value={ formValues.siteTitle }
					errors={ formErrors.siteTitle }
					name="siteTitle"
					onChange={ onChangeField }
				/>
			</AccordionFormSection>
			<AccordionFormSection
				sectionId={ SITE_INFO_SECTIONS.siteDescription }
				title={ translate( '%d. Site Description', {
					args: [ 2 ],
					comment: 'This is the serial number: 2',
				} ) }
				summary={ formValues.siteDescription }
				showSkip={ true }
				isTouched={ touchedStates.siteDescription }
			>
				<TextInputField
					label={ translate( 'A short description for your website.' ) }
					value={ formValues.siteDescription }
					name="siteDescription"
					onChange={ onChangeField }
				/>
			</AccordionFormSection>
			<AccordionFormSection
				sectionId={ SITE_INFO_SECTIONS.socialMedia }
				title={ translate( '%d. Social Media Profiles', {
					args: [ 3 ],
					comment: 'This is the serial number: 3',
				} ) }
				summary={ undefined }
				showSkip={ true }
				isTouched={ touchedStates.socialMedia }
			>
				<SocialMediaProfiles
					facebookProps={ {
						value: formValues.facebookUrl,
						name: 'facebookUrl',
					} }
					twitterProps={ {
						value: formValues.twitterUrl,
						name: 'twitterUrl',
					} }
					linkedinProps={ {
						value: formValues.linkedinUrl,
						name: 'linkedinUrl',
					} }
					instagramProps={ {
						value: formValues.instagramUrl,
						name: 'instagramUrl',
					} }
					onChange={ onChangeField }
				/>
			</AccordionFormSection>
			<AccordionFormSection
				sectionId={ SITE_INFO_SECTIONS.contactInfo }
				title={ translate( '%d. Contact Information', {
					args: [ 4 ],
					comment: 'This is the serial number: 4',
				} ) }
				summary={ undefined }
				showSkip={ true }
				isTouched={ touchedStates.contactInfo }
			>
				<ContactInformation
					displayEmailProps={ {
						value: formValues.displayEmail,
						name: 'displayEmail',
					} }
					displayPhoneProps={ {
						value: formValues.displayPhone,
						name: 'displayPhone',
					} }
					displayAddressProps={ {
						value: formValues.displayAddress,
						name: 'displayAddress',
					} }
					onChange={ onChangeField }
				/>
			</AccordionFormSection>
		</AccordionForm>
	);
}

export default function WrapperSiteInformationCollection(
	props: {
		flowName: string;
		stepName: string;
		positionInFlow: number;
	} & SiteInformationCollectionProps
) {
	const { flowName, stepName, positionInFlow } = props;
	const translate = useTranslate();

	const headerText = translate( 'Site Information' );
	const subHeaderText = translate( 'Basic details about your website' );

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={ <SiteInformationCollection { ...props } /> }
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align={ 'left' }
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
