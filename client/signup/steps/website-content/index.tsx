import page from '@automattic/calypso-router';
import { Button, ConfettiAnimation } from '@automattic/components';
import styled from '@emotion/styled';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, ChangeEvent, useCallback } from 'react';
import errorIllustration from 'calypso/assets/images/customer-home/disconnected.svg';
import Loading from 'calypso/components/loading';
import AccordionForm from 'calypso/signup/accordion-form/accordion-form';
import {
	BBE_STORE_WEBSITE_CONTENT_FILLING_STEP,
	BBE_WEBSITE_CONTENT_FILLING_STEP,
	useTranslatedPageTitles,
} from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useSelector, useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { saveSignupStep } from 'calypso/state/signup/progress/actions';
import {
	changesSaved,
	initializeWebsiteContentForm,
	updateWebsiteContentCurrentIndex,
} from 'calypso/state/signup/steps/website-content/actions';
import { useGetWebsiteContentQuery } from 'calypso/state/signup/steps/website-content/hooks/use-get-website-content-query';
import { useSaveWebsiteContentMutation } from 'calypso/state/signup/steps/website-content/hooks/use-save-website-content-mutation';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
	isMediaUploadInProgress,
	WebsiteContentStateModel,
	hasUnsavedChanges as hasUnsavedWebsiteContentChanges,
} from 'calypso/state/signup/steps/website-content/selectors';
import { getSiteId } from 'calypso/state/sites/selectors';
import { ContentGuidelinesDialog, ConfirmDialog } from './dialogs';
import { sectionGenerator } from './section-generator';
import type { ValidationErrors } from 'calypso/signup/accordion-form/types';
import type { WebsiteContentServerState } from 'calypso/state/signup/steps/website-content/types';
import type { SiteId } from 'calypso/types';

import './style.scss';

const debug = debugFactory( 'calypso:difm' );

const LinkButton = styled( Button )`
	text-decoration: underline;
	cursor: pointer;

	.formatted-header__subtitle
		button&[type='button'].button.is-borderless.is-primary.is-transparent:focus {
		border-color: transparent;
		box-shadow: none;
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
	siteId: SiteId | null;
	websiteContentServerState: WebsiteContentServerState;
}

function WebsiteContentStep( {
	additionalStepData,
	stepName,
	submitSignupStep,
	goToNextStep,
	siteId,
	websiteContentServerState,
}: WebsiteContentStepProps ) {
	const [ formErrors, setFormErrors ] = useState< ValidationErrors >( {} );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const websiteContent = useSelector( getWebsiteContent );
	const currentIndex = useSelector( getWebsiteContentDataCollectionIndex );
	const isImageUploading = useSelector( ( state ) =>
		isMediaUploadInProgress( state as WebsiteContentStateModel )
	);
	const hasUnsavedChanges = useSelector( hasUnsavedWebsiteContentChanges );

	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const translatedPageTitles = useTranslatedPageTitles();
	const context = websiteContentServerState.isStoreFlow
		? BBE_STORE_WEBSITE_CONTENT_FILLING_STEP
		: BBE_WEBSITE_CONTENT_FILLING_STEP;

	const { isPending: isSaving, mutateAsync } = useSaveWebsiteContentMutation(
		siteId,
		websiteContent
	);

	const saveFormValues = async () => {
		try {
			await mutateAsync();
			dispatch( changesSaved() );
			dispatch(
				successNotice( translate( 'Changes saved successfully!' ), {
					id: 'website-content-save-notice',
					duration: 3000,
				} )
			);
		} catch ( error ) {
			dispatch(
				errorNotice(
					translate( 'Failed to save your content. Please check your internet connection.' )
				)
			);
		}
	};

	useEffect( () => {
		const { selectedPageTitles } = websiteContentServerState;
		if ( siteId && selectedPageTitles && selectedPageTitles.length > 0 ) {
			dispatch( initializeWebsiteContentForm( websiteContentServerState, translatedPageTitles ) );
		}
	}, [ dispatch, siteId, translatedPageTitles, websiteContentServerState ] );

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
				context,
				onChangeField,
			} ),
		[ translate, websiteContent, formErrors, context, onChangeField ]
	);
	const generatedSections = generatedSectionsCallback();

	const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	return (
		<>
			<ConfettiAnimation trigger={ ! prefersReducedMotion } />
			<ConfirmDialog
				isConfirmDialogOpen={ isConfirmDialogOpen }
				setIsConfirmDialogOpen={ setIsConfirmDialogOpen }
				onSubmit={ onSubmit }
			/>
			<AccordionForm
				generatedSections={ generatedSections }
				onErrorUpdates={ ( errors ) => setFormErrors( errors ) }
				formValues={ websiteContent }
				currentIndex={ currentIndex }
				updateCurrentIndex={ ( currentIndex ) => {
					dispatch( updateWebsiteContentCurrentIndex( currentIndex ) );
				} }
				onSubmit={ () => setIsConfirmDialogOpen( true ) }
				saveFormValues={ saveFormValues }
				blockNavigation={ isImageUploading }
				isSaving={ isSaving }
				hasUnsavedChanges={ hasUnsavedChanges }
			/>
		</>
	);
}

function Loader() {
	const translate = useTranslate();
	return (
		<LoadingContainer>
			<Loading title={ translate( 'Loading your site information' ) } />
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
	const { skippedCheckout } = useSelector( getInitialQueryArguments ) ?? {};
	const { flowName, stepName, positionInFlow, queryObject } = props;
	const { siteId: siteIdFromQuery, siteSlug: siteSlugFromQuery } = queryObject;
	const translate = useTranslate();
	const siteIdFromSiteSlug = useSelector( ( state ) =>
		getSiteId( state, siteSlugFromQuery as string )
	);

	const selectedSiteId = isNaN( Number( siteIdFromQuery ) )
		? siteIdFromSiteSlug
		: Number( siteIdFromQuery );

	const { isLoading, isError, data } = useGetWebsiteContentQuery( selectedSiteId );

	const [ isContentGuidelinesDialogOpen, setIsContentGuidelinesDialogOpen ] = useState( true );

	const headerText = translate( 'Website Content' );

	const subHeaderTextTranslateArgs = {
		components: {
			br: <br />,
			Link: (
				<LinkButton
					borderless
					primary
					transparent
					onClick={ () => setIsContentGuidelinesDialogOpen( true ) }
				/>
			),
		},
	};

	const subHeaderText = data?.isStoreFlow
		? translate(
				'Provide content for your website build. You can add products later with the WordPress editor.{{br}}{{/br}}{{br}}{{/br}}{{Link}}View Content Guidelines{{/Link}}',
				subHeaderTextTranslateArgs
		  )
		: translate(
				'Provide content for your website build. You will be able to edit all content later using the WordPress editor.{{br}}{{/br}}{{br}}{{/br}}{{Link}}View Content Guidelines{{/Link}}',
				subHeaderTextTranslateArgs
		  );

	useEffect( () => {
		if ( data?.isWebsiteContentSubmitted ) {
			debug( 'Website content content already submitted, redirecting to home' );
			page( `/home/${ selectedSiteId }` );
		}
	}, [ data, selectedSiteId ] );

	useEffect( () => {
		if ( skippedCheckout === '1' ) {
			debug( 'User did not make a DIFM purchase, redirecting to home' );
			page( `/home/${ selectedSiteId }` );
		}
	}, [ skippedCheckout, selectedSiteId ] );

	if ( isLoading ) {
		return <Loader />;
	}

	if ( isError || ! ( data?.selectedPageTitles && data?.selectedPageTitles.length ) ) {
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
		<>
			<ContentGuidelinesDialog
				isContentGuidelinesDialogOpen={ isContentGuidelinesDialogOpen }
				setIsContentGuidelinesDialogOpen={ setIsContentGuidelinesDialogOpen }
			/>

			<StepWrapper
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				stepContent={
					<WebsiteContentStep
						{ ...props }
						websiteContentServerState={ data }
						siteId={ selectedSiteId }
					/>
				}
				goToNextStep={ false }
				hideFormattedHeader={ false }
				hideBack={ false }
				align="left"
				isHorizontalLayout
				isWideLayout
			/>
		</>
	);
}
