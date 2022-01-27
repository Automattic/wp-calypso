import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import {
	ContactInformation,
	TextInputField,
	SocialMediaProfiles,
} from 'calypso/signup/accordion-form/form-components';
import {
	AccordionSectionProps,
	SectionGeneratorReturnType,
} from 'calypso/signup/accordion-form/types';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	updateSiteInfoCurrentIndex,
	updateSiteInfoValues,
} from 'calypso/state/signup/steps/site-info-collection/actions';
import { SiteInfoCollectionData } from 'calypso/state/signup/steps/site-info-collection/schema';
import {
	getSiteInfoCollectionData,
	getSiteInfoCollectionCurrentIndex,
} from 'calypso/state/signup/steps/site-info-collection/selectors';

import './style.scss';

interface SiteInformationCollectionProps {
	additionalStepData: object;
	stepName: string;
	submitSignupStep: ( step: { stepName: string }, formValues: SiteInfoCollectionData ) => void;
	goToNextStep: () => void;
}

function sectionGenerator() {
	return ( {
		translate,
		formValues,
		formErrors,
		onChangeField,
	}: SectionGeneratorReturnType< SiteInfoCollectionData > ) => {
		const sections: AccordionSectionProps< SiteInfoCollectionData >[] = [
			{
				title: translate( '%d. Name of your business', {
					args: [ 1 ],
					comment: 'This is the serial number: 1',
				} ),
				component: (
					<TextInputField
						label={ translate(
							'Please enter the name of your business as you want it to appear on your new site.'
						) }
						value={ formValues.siteTitle }
						error={ formErrors.siteTitle }
						name="siteTitle"
						onChange={ onChangeField }
					/>
				),
				showSkip: false,
				summary: formValues.siteTitle,
				validate: ( formValues ) => {
					const isValid = Boolean( formValues.siteTitle?.length );
					return {
						result: isValid,
						errors: {
							siteTitle: isValid ? null : translate( 'Please enter a valid site title.' ),
						},
					};
				},
			},
			{
				title: translate( '%d. Site Description', {
					args: [ 2 ],
					comment: 'This is the serial number: 2',
				} ),
				component: (
					<TextInputField
						label={ translate( 'A short description for your website.' ) }
						value={ formValues.siteDescription }
						name="siteDescription"
						onChange={ onChangeField }
					/>
				),
				showSkip: true,
				summary: formValues.siteDescription,
			},
			{
				title: translate( '%d. Social Media Profiles', {
					args: [ 3 ],
					comment: 'This is the serial number: 3',
				} ),
				component: (
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
				),
				showSkip: true,
				summary: undefined,
			},
			{
				title: translate( '%d. Contact Information', {
					args: [ 4 ],
					comment: 'This is the serial number: 4',
				} ),
				component: (
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
				),
				showSkip: true,
				summary: undefined,
			},
		];
		return sections;
	};
}

function SiteInformationCollection( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
}: SiteInformationCollectionProps ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const siteInfoCollectionDataFromStore: SiteInfoCollectionData = useSelector(
		getSiteInfoCollectionData
	);
	const currentIndex: number = useSelector( getSiteInfoCollectionCurrentIndex );

	const onSubmit = ( formValues: SiteInfoCollectionData ) => {
		const step = {
			stepName,
			...additionalStepData,
		};
		submitSignupStep( step, {
			...formValues,
		} );
		goToNextStep();
	};

	return (
		<AccordionForm
			sectionGenerator={ sectionGenerator }
			formValuesInitialState={ siteInfoCollectionDataFromStore }
			currentIndex={ currentIndex }
			updateCurrentIndex={ ( index ) => {
				dispatch( updateSiteInfoCurrentIndex( index ) );
			} }
			updateFormValues={ ( formValues ) => {
				dispatch( updateSiteInfoValues( formValues ) );
			} }
			onSubmit={ onSubmit }
		/>
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
