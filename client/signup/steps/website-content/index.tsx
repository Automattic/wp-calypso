import { Button, Dialog } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import errorIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import { useTranslatedPageTitles } from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
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
import { getSiteId } from 'calypso/state/sites/selectors';
import { SiteId } from 'calypso/types';
import { sectionGenerator } from './section-generator';
import { usePollSiteForDIFMDetails } from './use-poll-site-for-difm-details';

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

const PagesNotAvailable = styled( LoadingContainer )`
	img {
		max-height: 200px;
		padding: 24px;
	}
`;

interface WebsiteContentStepProps {
	additionalStepData: object;
	submitSignupStep: ( step: { stepName: string } ) => void;
	goToNextStep: () => void;
	flowName: string;
	stepName: string;
	positionInFlow: string;
	pageTitles: string[];
	siteId: SiteId | null;
}

function WebsiteContentStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
	pageTitles,
	siteId,
}: WebsiteContentStepProps ) {
	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const isImageUploading = useSelector( ( state ) =>
		isImageUploadInProgress( state as WebsiteContentStateModel )
	);

	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const translatedPageTitles = useTranslatedPageTitles();

	useEffect( () => {
		if ( siteId && pageTitles && pageTitles.length > 0 ) {
			const pages = pageTitles.map( ( pageTitle ) => ( {
				id: pageTitle,
				name: translatedPageTitles[ pageTitle ],
			} ) );
			dispatch( initializePages( pages, siteId ) );
		}
	}, [ dispatch, pageTitles, siteId, translatedPageTitles ] );

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

	const urlParams = new URLSearchParams( window.location.search );
	const isFromCheckout = 'purchase-success' === urlParams.get( 'notice' );
	// If the user is coming from checkout, we can wait for a longer period to
	// ensure that the WoA sync has completed.
	const maxTries = isFromCheckout ? 30 : 10;

	const { hasValidPurchase, pageTitles, isPollingInProgress } = usePollSiteForDIFMDetails(
		siteId,
		maxTries
	);

	useEffect( () => {
		if ( isPollingInProgress ) {
			return;
		}
		if ( ! hasValidPurchase ) {
			debug( 'Website content content already submitted, redirecting to home' );
			page( `/home/${ queryObject.siteSlug }` );
		}
	}, [ hasValidPurchase, isPollingInProgress, queryObject.siteSlug ] );

	if ( isPollingInProgress ) {
		return <Loader />;
	}

	if ( ! ( pageTitles && pageTitles.length ) ) {
		return (
			<PagesNotAvailable>
				<img src={ errorIllustration } alt="" />
				<div>
					{ translate(
						'We could not retrieve your site information. Please {{SupportLink}}contact support{{/SupportLink}}.',
						{
							components: {
								SupportLink: (
									<a className="subtitle-link" rel="noopener noreferrer" href="/help/contact" />
								),
							},
						}
					) }
				</div>
			</PagesNotAvailable>
		);
	}

	return (
		<StepWrapper
			headerText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackHeaderText={ headerText }
			fallbackSubHeaderText={ subHeaderText }
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			stepContent={
				<WebsiteContentStep { ...props } pageTitles={ pageTitles } siteId={ siteId } />
			}
			goToNextStep={ false }
			hideFormattedHeader={ false }
			hideBack={ false }
			align="left"
			isHorizontalLayout={ true }
			isWideLayout={ true }
		/>
	);
}
