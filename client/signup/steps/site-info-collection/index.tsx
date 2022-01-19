import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
import { AccordionForm } from './accordion-form';
import { ContactInformation, TextInputField, SocialMediaProfiles } from './form-components';
import { AccordionSectionProps, ValidationErrors, ValidatorFunction } from './types';

import './style.scss';

interface SiteInformationCollectionProps {
	additionalStepData: object;
	stepName: string;
	submitSignupStep: ( step: { stepName: string }, formValues: SiteInfoCollectionData ) => void;
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

	const siteInfoCollectionDataFromStore: SiteInfoCollectionData = useSelector(
		getSiteInfoCollectionData
	);
	const currentIndex: number = useSelector( getSiteInfoCollectionCurrentIndex );

	// Initialize local state with the values from the redux store
	const [ formValues, setFormValues ] = useState< SiteInfoCollectionData >(
		siteInfoCollectionDataFromStore
	);
	const onChangeField = ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => {
		setFormValues( {
			...formValues,
			[ name ]: value,
		} );
	};

	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );

	const sections: AccordionSectionProps[] = [
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
			validate: ( { siteTitle } ) => {
				const isValid = Boolean( siteTitle?.length );
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

	const isSectionAtIndexTouchedInitialState: Record< string, boolean > = {};
	for ( let i = 0; i <= currentIndex; i++ ) {
		isSectionAtIndexTouchedInitialState[ `${ i }` ] = true;
	}

	const [ isSectionAtIndexTouched, setIsSectionAtIndexTouched ] = useState<
		Record< string, boolean >
	>( isSectionAtIndexTouchedInitialState );

	const runValidatorAndSetFormErrors = ( validator: ValidatorFunction ) => {
		const validationResult = validator( formValues );
		setFormErrors( {
			...formErrors,
			...validationResult.errors,
		} );
		return validationResult;
	};

	const submitStep = () => {
		// Re-run validation on all sections before submitting
		for ( let index = 0; index < sections.length; index++ ) {
			const section = sections[ index ];
			if ( section.validate ) {
				const validationResult = runValidatorAndSetFormErrors( section.validate );
				if ( ! validationResult.result ) {
					dispatch( updateSiteInfoCurrentIndex( index ) );
					return;
				}
			}
		}

		const step = {
			stepName,
			...additionalStepData,
		};
		submitSignupStep( step, {
			...formValues,
		} );
		goToNextStep();
	};

	const onOpen = ( currentIndex: number ) => {
		dispatch( updateSiteInfoCurrentIndex( currentIndex ) );
		dispatch( updateSiteInfoValues( formValues ) );
		setIsSectionAtIndexTouched( { ...isSectionAtIndexTouched, [ `${ currentIndex }` ]: true } );
	};

	const onNext = ( validator?: ValidatorFunction ) => {
		dispatch( updateSiteInfoValues( formValues ) );

		if ( validator ) {
			const validationResult = runValidatorAndSetFormErrors( validator );
			if ( ! validationResult.result ) {
				return;
			}
		}

		if ( currentIndex < sections.length - 1 ) {
			dispatch( updateSiteInfoCurrentIndex( currentIndex + 1 ) );
			setIsSectionAtIndexTouched( {
				...isSectionAtIndexTouched,
				[ `${ currentIndex + 1 }` ]: true,
			} );
		} else {
			submitStep();
		}
	};

	return (
		<AccordionForm
			sections={ sections }
			currentIndex={ currentIndex }
			isSectionAtIndexTouched={ isSectionAtIndexTouched }
			onNext={ onNext }
			onOpen={ onOpen }
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
