import config from '@automattic/calypso-config';
import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, ChangeEvent, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { logToLogstash } from 'calypso/lib/logstash';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import { useTranslatedPageTitles } from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
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
import type { SiteId } from 'calypso/types';

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

const LoadingContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	width: 100%;
	height: 90vh;
	h1 {
		font-size: 24px;
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
	const pageTitles = useSelector( ( state ) => getDIFMLiteSitePageTitles( state, siteId ) );
	const isImageUploading = useSelector( ( state ) =>
		isImageUploadInProgress( state as WebsiteContentStateModel )
	);

	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const translatedPageTitles = useTranslatedPageTitles();

	useEffect( () => {
		if ( websiteContent.pages.length > 0 ) {
			// Already initialized.
			return;
		}

		if ( pageTitles && pageTitles.length > 0 ) {
			const pages = pageTitles.map( ( pageTitle ) => ( {
				id: pageTitle,
				name: translatedPageTitles[ pageTitle ],
			} ) );
			dispatch( initializePages( pages ) );
		}
	}, [ dispatch, pageTitles, translatedPageTitles, websiteContent.pages.length ] );

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

/**
 * Hook that polls the /rest/v1.2/sites/<site fragment> API.
 * It checks the site details for a valid DIFM purchase.
 * A valid DIFM purchase has `.options.is_difm_lite_in_progress` set to `true`
 * and `.options.difm_lite_site_options.pages` should be an array of strings.
 * Also, `.options.difm_lite_site_options.is_website_content_submitted` should be
 * `false/null` to indicate that the users has not submitted content yet.
 *
 *
 * If the above conditions are met, the hook returns { isPollingInProgress: false, hasValidPurchase: true }.
 * If the above conditions are not met, it retries the request MAXTRIES times,
 * with a linear backoff. If the conditions are still not met, the hook returns
 * { isPollingInProgress: false, hasValidPurchase: false }.
 * The default return value is { isPollingInProgress: true, hasValidPurchase: false }
 *
 * @param {(SiteId | null)} siteId The current site ID.
 * @returns {{
 * 	isPollingInProgress: boolean;
 * 	hasValidPurchase: boolean;
 * }}
 */
function usePollSiteForDIFMDetails( siteId: SiteId | null ): {
	isPollingInProgress: boolean;
	hasValidPurchase: boolean;
} {
	const MAXTRIES = 10;
	const [ retryCount, setRetryCount ] = useState( 0 );
	const [ isPollingInProgress, setIsPollingInProgress ] = useState( true );
	const [ hasValidPurchase, setHasValidPurchase ] = useState( false );
	const dispatch = useDispatch();

	const isLoadingSiteInformation = useSelector( ( state ) =>
		isRequestingSite( state, siteId as number )
	);

	const pageTitles = useSelector( ( state ) => getDIFMLiteSitePageTitles( state, siteId ) );
	const isInProgress = useSelector( ( state ) => isDIFMLiteInProgress( state, siteId ) );
	const isWebsiteContentSubmitted = useSelector( ( state ) =>
		isDIFMLiteWebsiteContentSubmitted( state, siteId )
	);

	const timeout = useRef< number >();

	useEffect( () => {
		async function checkSite() {
			if ( ! siteId ) {
				return;
			}

			if ( isLoadingSiteInformation ) {
				// A request is already in progress
				return;
			}

			await dispatch( requestSite( siteId ) );

			if ( isInProgress && isWebsiteContentSubmitted !== true ) {
				setHasValidPurchase( true );
			}

			if ( pageTitles && pageTitles.length ) {
				setIsPollingInProgress( false );
			}
		}

		if ( isPollingInProgress && retryCount < MAXTRIES ) {
			// Only refresh 10 times
			timeout.current = window.setTimeout( () => {
				setRetryCount( ( retryCount ) => retryCount + 1 );
				checkSite();
			}, retryCount * 600 );
		}

		if ( retryCount === MAXTRIES ) {
			setIsPollingInProgress( false );
			logToLogstash( {
				feature: 'calypso_client',
				message: 'BBEX Content Form: Max retries exceeded.',
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
				blog_id: siteId,
				extra: {
					isInProgress,
					isWebsiteContentSubmitted,
					pageTitles,
				},
			} );
		}

		return () => {
			clearTimeout( timeout.current );
		};
	}, [
		isPollingInProgress,
		siteId,
		retryCount,
		dispatch,
		isLoadingSiteInformation,
		pageTitles,
		isInProgress,
		isWebsiteContentSubmitted,
	] );

	return {
		isPollingInProgress,
		hasValidPurchase: isPollingInProgress ? false : hasValidPurchase,
	};
}

function Loader() {
	const translate = useTranslate();
	return (
		<LoadingContainer>
			<h1 className="wp-brand-font">{ translate( 'Loading your site information' ) }</h1>
			<LoadingEllipsis />
		</LoadingContainer>
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
	const headerText = translate( 'Website Content' );
	const subHeaderText = translate(
		'Add your logo, page text and media to be used on your website.'
	);
	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );

	const { hasValidPurchase, isPollingInProgress } = usePollSiteForDIFMDetails( siteId );

	useEffect( () => {
		if ( isPollingInProgress ) {
			return;
		}
		if ( ! hasValidPurchase ) {
			debug( 'Website content content already submitted, redirecting to home' );
			page( `/home/${ queryObject.siteSlug }` );
		}
	}, [ hasValidPurchase, isPollingInProgress, queryObject.siteSlug ] );

	return isPollingInProgress ? (
		<Loader />
	) : (
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
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
