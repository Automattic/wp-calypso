import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	initializePages,
	updateWebsiteContentCurrentIndex,
} from 'calypso/state/signup/steps/website-content/actions';
import { WebsiteContent } from 'calypso/state/signup/steps/website-content/schema';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
} from 'calypso/state/signup/steps/website-content/selectors';
import { sectionGenerator } from './section-generator';
import './style.scss';

interface WebsiteContentStepProps {
	additionalStepData: object;
	submitSignupStep: ( step: { stepName: string }, formValues: WebsiteContent ) => void;
	goToNextStep: () => void;
	flowName: string;
	stepName: string;
	positionInFlow: string;
}

function WebsiteContentStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
}: WebsiteContentStepProps ) {
	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ formErrors, setFormErrors ] = useState< any >( {} );

	useEffect( () => {
		dispatch(
			initializePages( [
				{ id: 'Home', name: translate( 'Homepage' ) },
				{ id: 'About', name: translate( 'About' ) },
				{ id: 'Contact', name: translate( 'Contact' ) },
			] )
		);
	}, [ dispatch, initializePages ] );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const onSubmit = ( formValues: WebsiteContent ) => {
		const step = {
			stepName,
			...additionalStepData,
		};
		submitSignupStep( step, {
			...formValues,
		} );
		goToNextStep();
	};

	const onChangeField = ( { target: { name } }: ChangeEvent< HTMLInputElement > ) => {
		setFormErrors( { ...formErrors, [ name ]: null } );
	};

	const generatedSectionsCallback = useCallback(
		() =>
			sectionGenerator( {
				translate,
				formValues: websiteContent,
				formErrors: formErrors,
				onChangeField,
			} ),
		[ translate, websiteContent, formErrors ]
	);
	const generatedSections = generatedSectionsCallback();
	return (
		<AccordionForm
			generatedSections={ generatedSections }
			onErrorUpdates={ ( errors ) => setFormErrors( errors ) }
			formValuesInitialState={ websiteContent }
			currentIndex={ currentIndex }
			updateCurrentIndex={ ( currentIndex ) => {
				dispatch( updateWebsiteContentCurrentIndex( currentIndex ) );
			} }
			onSubmit={ onSubmit }
		/>
	);
}

export default function WrapperWebsiteContent(
	props: {
		flowName: string;
		stepName: string;
		positionInFlow: string;
	} & WebsiteContentStepProps
) {
	const { flowName, stepName, positionInFlow } = props;
	const translate = useTranslate();

	const headerText = translate( 'Website Content' );
	const subHeaderText = translate(
		'In this step, you will add your brand visuals, pages and media to be used on your website.'
	);

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={ <WebsiteContentStep { ...props } /> }
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align={ 'left' }
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
