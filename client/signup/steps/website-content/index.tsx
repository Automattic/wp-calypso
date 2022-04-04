import calypsoConfig from '@automattic/calypso-config';
import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import {
	PORTFOLIO_PAGE,
	HOME_PAGE,
	ABOUT_PAGE,
	CONTACT_PAGE,
	MENU_PAGE,
	SERVICES_PAGE,
} from 'calypso/signup/difm/constants';
import { useTranslatedPageTitles } from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
import getDIFMLiteSiteCategory from 'calypso/state/selectors/get-difm-lite-site-category';
import getDIFMLiteSitePageTitles from 'calypso/state/selectors/get-difm-lite-site-page-titles';
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
	isImageUploadInProgress,
	WebsiteContentStateModel,
} from 'calypso/state/signup/steps/website-content/selectors';
import { requestSite } from 'calypso/state/sites/actions';
import { getSiteId, isRequestingSite } from 'calypso/state/sites/selectors';
import { sectionGenerator } from './section-generator';
import './style.scss';

const debug = debugFactory( 'calypso:difm' );

const DialogContent = styled.div`
	padding: 16px;
	p {
		font-size: 1rem;
		color: var( --studio-gray-50 );
	}
`;

const DialogButton = styled( Button )`
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 5px;
	padding: ${ ( props ) => ( props.primary ? '10px 64px' : '10px 32px' ) };
	--color-accent: #117ac9;
	--color-accent-60: #0e64a5;
	.gridicon {
		margin-left: 10px;
	}
`;

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
	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );
	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const siteCategory = useSelector( ( state ) => getDIFMLiteSiteCategory( state, siteId ) );
	const pageTitles = useSelector( ( state ) => getDIFMLiteSitePageTitles( state, siteId ) );
	const isImageUploading = useSelector( ( state ) =>
		isImageUploadInProgress( state as WebsiteContentStateModel )
	);

	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const translatedPageTitles = useTranslatedPageTitles();

	useEffect( () => {
		function getPageFromCategory( category: string | null ) {
			switch ( category ) {
				case 'creative-arts':
					return { id: PORTFOLIO_PAGE, name: translatedPageTitles[ PORTFOLIO_PAGE ] };
				case 'restaurant':
					return { id: MENU_PAGE, name: translatedPageTitles[ MENU_PAGE ] };
				default:
					return { id: SERVICES_PAGE, name: translatedPageTitles[ SERVICES_PAGE ] };
			}
		}

		if ( calypsoConfig.isEnabled( 'signup/redesigned-difm-flow' ) ) {
			if ( pageTitles && pageTitles.length > 0 ) {
				const pages = pageTitles.map( ( pageTitle ) => ( {
					id: pageTitle,
					name: translatedPageTitles[ pageTitle ],
				} ) );
				dispatch( initializePages( pages ) );
			}
		} else if ( siteCategory ) {
			dispatch(
				initializePages( [
					{ id: HOME_PAGE, name: translatedPageTitles[ HOME_PAGE ] },
					{ id: ABOUT_PAGE, name: translatedPageTitles[ ABOUT_PAGE ] },
					{ id: CONTACT_PAGE, name: translatedPageTitles[ CONTACT_PAGE ] },
					getPageFromCategory( siteCategory ),
				] )
			);
		}
	}, [ dispatch, siteCategory, pageTitles, translatedPageTitles ] );

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

	const onChangeField = useCallback(
		( { target: { name } }: ChangeEvent< HTMLInputElement > ) => {
			setFormErrors( { ...formErrors, [ name ]: null } );
		},
		[ formErrors, setFormErrors ]
	);

	const generatedSectionsCallback = useCallback(
		() =>
			sectionGenerator( {
				translate,
				formValues: websiteContent,
				formErrors: formErrors,
				onChangeField,
			} ),
		[ translate, websiteContent, formErrors, onChangeField ]
	);
	const generatedSections = generatedSectionsCallback();

	const dialogButtons = [
		<DialogButton onClick={ () => setIsConfirmDialogOpen( false ) }>
			{ translate( 'Cancel' ) }
		</DialogButton>,
		<DialogButton primary onClick={ onSubmit }>
			{ translate( 'Submit' ) }
		</DialogButton>,
	];

	return (
		<>
			<Dialog
				isVisible={ isConfirmDialogOpen }
				onClose={ () => setIsConfirmDialogOpen( false ) }
				buttons={ dialogButtons }
			>
				<DialogContent>
					<h1>{ translate( 'Submit Content?' ) }</h1>
					<p>
						{ translate(
							'Click "Submit" to start your site build or "Cancel" to make further edits.'
						) }
					</p>
				</DialogContent>
			</Dialog>

			<AccordionForm
				generatedSections={ generatedSections }
				onErrorUpdates={ ( errors ) => setFormErrors( errors ) }
				formValuesInitialState={ websiteContent }
				currentIndex={ currentIndex }
				updateCurrentIndex={ ( currentIndex ) => {
					dispatch( updateWebsiteContentCurrentIndex( currentIndex ) );
				} }
				onSubmit={ () => setIsConfirmDialogOpen( true ) }
				blockNavigation={ isImageUploading }
			/>
		</>
	);
}

export default function WrapperWebsiteContent(
	props: {
		flowName: string;
		stepName: string;
		positionInFlow: string;
		queryObject: {
			siteSlug?: string;
			siteId?: string;
		};
	} & WebsiteContentStepProps
) {
	const { flowName, stepName, positionInFlow, queryObject } = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const headerText = translate( 'Website Content' );
	const subHeaderText = translate(
		'In this step, you will add your brand visuals, pages and media to be used on your website.'
	);
	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );

	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);
	const isLoadingSiteInformation = useSelector( ( state ) =>
		isRequestingSite( state, siteId as number )
	);

	// We assume that difm lite is purchased when the is_difm_lite_in_progress sticker is active in a given blog
	const isDifmLitePurchased = useSelector( ( state ) => isDIFMLiteInProgress( state, siteId ) );

	//Make sure the most up to date site information is loaded so that we can validate access to this page
	useEffect( () => {
		siteId && dispatch( requestSite( siteId ) );
	}, [ dispatch, siteId ] );

	useEffect( () => {
		if ( ! isLoadingSiteInformation ) {
			if ( ! isDifmLitePurchased ) {
				debug( 'DIFM not purchased yet, redirecting to DIFM purchase flow' );
				// Due to a bug related to a  race condition this redirection is currently disabled
				// Read pdh1Xd-xv-p2#comment-869 for more context (Submission loop with existing site)
				// page( `/start/do-it-for-me` );
			} else if ( isWebsiteContentSubmitted ) {
				debug( 'Website content content already submitted, redirecting to home' );
				page( `/home/${ queryObject.siteSlug }` );
			}
		}
	}, [
		isLoadingSiteInformation,
		isDifmLitePurchased,
		isWebsiteContentSubmitted,
		queryObject.siteSlug,
	] );

	return isWebsiteContentSubmitted || isLoadingSiteInformation ? null : (
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
