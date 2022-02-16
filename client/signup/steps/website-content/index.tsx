import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import StepWrapper from 'calypso/signup/step-wrapper';
import getDIFMLiteSiteCategory from 'calypso/state/selectors/get-difm-lite-site-category';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import isDIFMLiteWebsiteContentSubmitted from 'calypso/state/selectors/is-difm-lite-website-content-submitted';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	initializePages,
	updateWebsiteContentCurrentIndex,
} from 'calypso/state/signup/steps/website-content/actions';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
} from 'calypso/state/signup/steps/website-content/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId, isRequestingSite } from 'calypso/state/sites/selectors';
import { sectionGenerator } from './section-generator';
import './style.scss';

const debug = debugFactory( 'calypso:difm' );

interface WebsiteContentStepProps {
	additionalStepData: object;
	submitSignupStep: ( step: { stepName: string } ) => void;
	goToNextStep: () => void;
	flowName: string;
	stepName: string;
	positionInFlow: string;
	queryObject: {
		siteSlug?: string;
		siteId?: string;
	};
}

function WebsiteContentStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
	queryObject,
}: WebsiteContentStepProps ) {
	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );
	const dispatch = useDispatch();
	const translate = useTranslate();

	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );
	const siteCategory = useSelector( ( state ) => getDIFMLiteSiteCategory( state, siteId ) );
	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);
	const isSiteInformationLoaded = useSelector( ( state ) =>
		isRequestingSite( state, siteId as number )
	);

	// We assume that difm lite is purchased when the is_difm_lite_in_progress sticker is active in a given blog
	const isDifmLitePurchased = useSelector( ( state ) => isDIFMLiteInProgress( state, siteId ) );

	//Make sure site information is loaded so that we can validate access to this page
	useEffect( () => {
		siteId && dispatch( requestSite( siteId ) );
	}, [ siteId ] );

	useEffect( () => {
		if ( isSiteInformationLoaded && ! isDifmLitePurchased ) {
			debug( 'DIFM not purchased yet, redirecting to DIFM purchase flow' );
			page( `/start/do-it-for-me?siteSlug=${ queryObject.siteSlug }` );
		} else if ( isWebsiteContentSubmitted ) {
			debug( 'Website content content already submitted, redirecting to home' );
			page( `/home/${ queryObject.siteSlug }` );
		}
	}, [
		isSiteInformationLoaded,
		isDifmLitePurchased,
		isWebsiteContentSubmitted,
		queryObject.siteSlug,
	] );

	useEffect( () => {
		function getPageFromCategory( category: string | null ) {
			switch ( category ) {
				case 'professional-services':
				case 'local-services':
					return { id: 'Services', name: translate( 'Services' ) };
				case 'creative-arts':
					return { id: 'Portfolio', name: translate( 'Portfolio' ) };
				case 'restaurant':
					return { id: 'Menu', name: translate( 'Menu' ) };
				default:
					return { id: 'Blog', name: translate( 'Blog' ) };
					break;
			}
		}

		if ( siteCategory ) {
			dispatch(
				initializePages( [
					{ id: 'Home', name: translate( 'Homepage' ) },
					{ id: 'About', name: translate( 'About' ) },
					{ id: 'Contact', name: translate( 'Contact' ) },
					getPageFromCategory( siteCategory ),
				] )
			);
		}
	}, [ dispatch, siteCategory, translate ] );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [ dispatch, stepName ] );

	const onSubmit = () => {
		const step = {
			stepName,
			...additionalStepData,
		};
		submitSignupStep( step );
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
		<>
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
		</>
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
