import config from '@automattic/calypso-config';
import { getDIFMTieredPriceDetails, WPCOM_DIFM_LITE } from '@automattic/calypso-products';
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider } from '@automattic/calypso-stripe';
import { Button } from '@automattic/components';
import { createRequestCartProduct } from '@automattic/shopping-cart';
import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { logToLogstash } from 'calypso/lib/logstash';
import { getRazorpayConfiguration, getStripeConfiguration } from 'calypso/lib/store-transactions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import PurchaseModal from 'calypso/my-sites/checkout/purchase-modal';
import { useIsEligibleForOneClickCheckout } from 'calypso/my-sites/checkout/purchase-modal/use-is-eligible-for-one-click-checkout';
import { BrowserView } from 'calypso/signup/difm/components/BrowserView';
import {
	HOME_PAGE,
	BLOG_PAGE,
	CONTACT_PAGE,
	ABOUT_PAGE,
	PHOTO_GALLERY_PAGE,
	VIDEO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	FAQ_PAGE,
	SERVICES_PAGE,
	TESTIMONIALS_PAGE,
	PRICING_PAGE,
	TEAM_PAGE,
	SHOP_PAGE,
	CUSTOM_PAGE,
	EVENTS_PAGE,
	CAREERS_PAGE,
	DONATE_PAGE,
	NEWSLETTER_PAGE,
	CASE_STUDIES_PAGE,
} from 'calypso/signup/difm/constants';
import {
	BBE_ONBOARDING_PAGE_PICKER_STEP,
	BBE_STORE_ONBOARDING_PAGE_PICKER_STEP,
	useTranslatedPageDescriptions,
	useTranslatedPageTitles,
} from 'calypso/signup/difm/translation-hooks';
import StepWrapper from 'calypso/signup/step-wrapper';
import useLongFetchingDetection from 'calypso/site-profiler/hooks/use-long-fetching-detection';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { buildDIFMCartExtrasObject } from 'calypso/state/difm/assemblers';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteId, getSitePlan } from 'calypso/state/sites/selectors';
import ShoppingCartForDIFM from './shopping-cart-for-difm';
import useCartForDIFM from './use-cart-for-difm';
import type { PageId } from 'calypso/signup/difm/constants';
import type { BBETranslationContext } from 'calypso/signup/difm/translation-hooks';
import type { Dependencies } from 'calypso/signup/types';
import type { SiteId, SiteSlug } from 'calypso/types';

import './style.scss';

const PageGrid = styled.div`
	display: grid;
	grid-template-columns: repeat( 2, minmax( 0, 1fr ) );
	row-gap: 20px;
	column-gap: 15px;
	margin: 0 0 30px;

	@media ( min-width: 600px ) and ( max-width: 750px ) {
		grid-template-columns: 1fr;
		column-gap: 15px;
		row-gap: 25px;
	}

	@media ( min-width: 1200px ) {
		grid-template-columns: 1fr 1fr 1fr;
		row-gap: 40px;
		column-gap: 35px;
	}

	@media ( max-width: 600px ) {
		margin: 0 0 200px;
	}
`;

const GridCellContainer = styled.div< { isClickDisabled: boolean; isSelected: boolean } >`
	cursor: default;
	opacity: ${ ( { isSelected, isClickDisabled } ) =>
		! isSelected && isClickDisabled ? '0.4' : '1' };
	border-radius: 4px;
	position: relative;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-weight: 500;
`;

const CellLabelContainer = styled.div`
	margin: 14px 0;
	text-align: left;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 12px;
	gap: 8px;
	width: 100%;
	@media ( min-width: 960px ) {
		font-size: 14px;
		justify-content: left;
	}

	.info-popover {
		margin-inline-start: auto;
	}
`;

const PageCellBadge = styled.div`
	background: var( --studio-green-5 );
	border-radius: 4px;
	text-align: center;
	font-size: 12px;
	padding: 0 6px;
	line-height: 20px;
	font-weight: 500;
	color: var( --studio-green-80 );
	height: 20px;
	width: auto;
`;

interface PageCellType {
	pageId: PageId;
	selectedPages: string[];
	onClick: ( pageId: string ) => void;
	popular?: boolean;
	required?: boolean;
	context: BBETranslationContext;
}

function PageCell( { pageId, popular, required, selectedPages, context, onClick }: PageCellType ) {
	const translate = useTranslate();
	const selectedIndex = selectedPages.indexOf( pageId );
	const isSelected = Boolean( selectedIndex > -1 );
	const title = useTranslatedPageTitles()[ pageId ];
	const description = useTranslatedPageDescriptions( pageId, context );

	return (
		<GridCellContainer isSelected={ isSelected } isClickDisabled={ false }>
			<BrowserView
				onClick={ () => onClick( pageId ) }
				pageId={ pageId }
				isClickDisabled={ false }
				isSelected={ isSelected }
				selectedIndex={ selectedIndex >= 0 ? selectedIndex : -1 }
			/>
			<CellLabelContainer>
				<div>{ title }</div>
				{ popular ? <PageCellBadge>{ translate( 'Popular' ) }</PageCellBadge> : null }
				{ required ? <PageCellBadge>{ translate( 'Required' ) }</PageCellBadge> : null }
				<InfoPopover showOnHover position={ isMobile() ? 'left' : 'top left' }>
					{ description }
				</InfoPopover>
			</CellLabelContainer>
		</GridCellContainer>
	);
}

function PageSelector( {
	selectedPages,
	setSelectedPages,
	isStoreFlow,
}: {
	selectedPages: string[];
	setSelectedPages: ( pages: string[] ) => void;
	isStoreFlow: boolean;
} ) {
	const onPageClick = ( pageId: string ) => {
		const isPageSelected = selectedPages.includes( pageId );
		// The home page cannot be touched and is always included
		if ( ! [ HOME_PAGE, SHOP_PAGE ].includes( pageId ) ) {
			if ( isPageSelected ) {
				// Unselect selected page
				setSelectedPages( selectedPages.filter( ( page ) => page !== pageId ) );
			} else {
				setSelectedPages( [ ...selectedPages, pageId ] );
			}
		}
	};

	const context = isStoreFlow
		? BBE_STORE_ONBOARDING_PAGE_PICKER_STEP
		: BBE_ONBOARDING_PAGE_PICKER_STEP;

	return (
		<PageGrid>
			<PageCell
				context={ context }
				required
				pageId={ HOME_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			{ isStoreFlow && (
				<PageCell
					context={ context }
					required
					pageId={ SHOP_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) }
			<PageCell
				context={ context }
				popular
				pageId={ ABOUT_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				popular
				pageId={ CONTACT_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>

			<PageCell
				context={ context }
				popular
				pageId={ BLOG_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>

			<PageCell
				context={ context }
				pageId={ PHOTO_GALLERY_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			{ isStoreFlow ? (
				<PageCell
					context={ context }
					popular
					pageId={ FAQ_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) : (
				<PageCell
					context={ context }
					popular
					pageId={ SERVICES_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) }
			<PageCell
				context={ context }
				pageId={ VIDEO_GALLERY_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			{ ! isStoreFlow && (
				<PageCell
					context={ context }
					popular
					pageId={ PRICING_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) }
			<PageCell
				context={ context }
				pageId={ PORTFOLIO_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			{ isStoreFlow ? (
				<PageCell
					context={ context }
					pageId={ SERVICES_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) : (
				<PageCell
					context={ context }
					popular
					pageId={ FAQ_PAGE }
					selectedPages={ selectedPages }
					onClick={ onPageClick }
				/>
			) }
			<PageCell
				context={ context }
				popular={ isStoreFlow }
				pageId={ TESTIMONIALS_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ TEAM_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ CAREERS_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ EVENTS_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ DONATE_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ NEWSLETTER_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				context={ context }
				pageId={ CASE_STUDIES_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
			<PageCell
				popular
				context={ context }
				pageId={ CUSTOM_PAGE }
				selectedPages={ selectedPages }
				onClick={ onPageClick }
			/>
		</PageGrid>
	);
}

interface StepProps {
	stepSectionName: string | null;
	stepName: string;
	flowName: string;
	goToStep: () => void;
	goToNextStep: () => void;
	signupDependencies: Dependencies;
}

const StyledButton = styled( Button )`
	&.button.is-primary {
		padding: 10px 27px 10px 28px;
	}
`;

const Placeholder = styled.span`
	animation: pulse-light 2s ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 16px;
	display: inline-block;
	min-width: 32px;
`;

function OneClickPurchaseModal( {
	onClose,
	siteSlug,
	siteId,
	selectedPages,
	isStoreFlow,
	flowName,
	coupon,
}: {
	onClose: () => void;
	siteSlug: SiteSlug;
	siteId: SiteId;
	selectedPages: string[];
	isStoreFlow: boolean;
	flowName: string;
	coupon?: string;
} ) {
	const translate = useTranslate();
	const signupDependencies = useSelector( getSignupDependencyStore );
	const product = useMemo( () => {
		return createRequestCartProduct( {
			product_slug: WPCOM_DIFM_LITE,
			extra: buildDIFMCartExtrasObject(
				{
					...signupDependencies,
					selectedPageTitles: selectedPages,
					isStoreFlow,
				},
				siteId,
				`page-picker-one-click-modal-flow-${ flowName }`
			),
			quantity: selectedPages.length,
		} );
	}, [ flowName, isStoreFlow, selectedPages, signupDependencies, siteId ] );

	return (
		<CalypsoShoppingCartProvider>
			<StripeHookProvider
				fetchStripeConfiguration={ getStripeConfiguration }
				locale={ translate.localeSlug }
			>
				<RazorpayHookProvider fetchRazorpayConfiguration={ getRazorpayConfiguration }>
					<PurchaseModal
						productToAdd={ product }
						coupon={ coupon }
						onClose={ onClose }
						showFeatureList={ false }
						siteSlug={ siteSlug }
					/>
				</RazorpayHookProvider>
			</StripeHookProvider>
		</CalypsoShoppingCartProvider>
	);
}

function DIFMPagePicker( props: StepProps ) {
	const {
		stepName,
		goToNextStep,
		signupDependencies: {
			siteId: siteIdFromDependencies,
			siteSlug,
			newOrExistingSiteChoice,
			coupon,
		},
		flowName,
	} = props;
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isStoreFlow = 'do-it-for-me-store' === flowName;
	const [ isCheckoutPressed, setIsCheckoutPressed ] = useState( false );
	const [ showPurchaseModal, setShowPurchaseModal ] = useState( false );
	const [ selectedPages, setSelectedPages ] = useState< string[] >(
		isStoreFlow
			? [ HOME_PAGE, SHOP_PAGE, ABOUT_PAGE, CONTACT_PAGE ]
			: [ HOME_PAGE, ABOUT_PAGE, CONTACT_PAGE, PHOTO_GALLERY_PAGE, SERVICES_PAGE ]
	);

	const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) ) || siteIdFromDependencies;
	const currentPlan = useSelector( ( state ) => ( siteId ? getSitePlan( state, siteId ) : null ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || '';

	const isExistingSite = newOrExistingSiteChoice === 'existing-site' || siteSlug;

	const { isProductsLoading } = useCartForDIFM( {
		selectedPages,
		isStoreFlow,
		currentPlanSlug: currentPlan?.product_slug,
	} );

	const difmLiteProduct = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	let difmTieredPriceDetails = null;
	if ( difmLiteProduct ) {
		difmTieredPriceDetails = getDIFMTieredPriceDetails( difmLiteProduct, selectedPages.length );
	}

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
		triggerGuidesForStep( flowName, stepName );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const {
		isLoading: isLoadingIsEligibleForOneClickCheckout,
		result: isEligibleForOneClickCheckout,
	} = useIsEligibleForOneClickCheckout();

	const submitPickedPages = async () => {
		if ( ! isCheckoutPressed ) {
			setIsCheckoutPressed( true );

			if ( true === isEligibleForOneClickCheckout && isExistingSite ) {
				setShowPurchaseModal( true );
				return;
			}

			dispatch( submitSignupStep( { stepName }, { selectedPageTitles: selectedPages } ) );
			goToNextStep();
		}
	};

	const handleModalOnClose = () => {
		setShowPurchaseModal( false );
		setIsCheckoutPressed( false );
		setSelectedPages( ( selectedPages ) => selectedPages.slice() );
	};

	const isCheckoutButtonBusy =
		isProductsLoading ||
		( isExistingSite && isLoadingIsEligibleForOneClickCheckout ) ||
		isCheckoutPressed;

	const isBusyForWhile = useLongFetchingDetection( 'difm-page-picker', isCheckoutButtonBusy, 5000 );

	const hasLogged = useRef< boolean >( false );
	useEffect( () => {
		if ( isBusyForWhile && ! hasLogged.current ) {
			hasLogged.current = true;
			const message =
				'Page Picker Infinite Loading state:' +
				` isProductsLoading: ${ isProductsLoading }` +
				` isLoadingIsEligibleForOneClickCheckout: ${ isLoadingIsEligibleForOneClickCheckout }`;
			logToLogstash( {
				feature: 'calypso_client',
				message,
				severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			} );
		}
	}, [ isBusyForWhile, isLoadingIsEligibleForOneClickCheckout, isProductsLoading ] );

	const headerText = translate( 'Add pages to your {{wbr}}{{/wbr}}website', {
		components: { wbr: <wbr /> },
	} );

	const subHeaderText = isStoreFlow
		? translate(
				'Click on the thumbnails to select or deselect pages. Your site build includes up to %(freePageCount)s pages, and you can add more for {{PriceWrapper}}%(extraPagePrice)s{{/PriceWrapper}} each. After checkout, you will have the opportunity to submit your content.' +
					'{{br}}{{/br}}{{br}}{{/br}}A cart and checkout are also included with your site.{{br}}{{/br}}You can add products later with the WordPress editor.',
				{
					components: {
						br: <br />,
						PriceWrapper: difmTieredPriceDetails?.perExtraPagePrice ? <span /> : <Placeholder />,
					},
					args: {
						freePageCount: difmTieredPriceDetails?.numberOfIncludedPages as number,
						extraPagePrice: formatCurrency(
							difmTieredPriceDetails?.perExtraPagePrice ?? 0,
							currencyCode ?? '',
							{
								stripZeros: true,
								isSmallestUnit: true,
							}
						),
					},
				}
		  )
		: translate(
				'Click on the thumbnails to select or deselect pages. Your site build includes up to %(freePageCount)s pages, and you can add more for {{PriceWrapper}}%(extraPagePrice)s{{/PriceWrapper}} each. After checkout, you will have the opportunity to submit your content.',
				{
					components: {
						br: <br />,
						PriceWrapper: difmTieredPriceDetails?.perExtraPagePrice ? <span /> : <Placeholder />,
					},
					args: {
						freePageCount: difmTieredPriceDetails?.numberOfIncludedPages as number,
						extraPagePrice: formatCurrency(
							difmTieredPriceDetails?.perExtraPagePrice ?? 0,
							currencyCode ?? '',
							{
								stripZeros: true,
								isSmallestUnit: true,
							}
						),
					},
				}
		  );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<>
					{ showPurchaseModal && (
						<OneClickPurchaseModal
							onClose={ handleModalOnClose }
							siteSlug={ siteSlug }
							siteId={ siteId }
							selectedPages={ selectedPages }
							isStoreFlow={ isStoreFlow }
							flowName={ flowName }
							coupon={ coupon }
						/>
					) }
					<PageSelector
						isStoreFlow={ isStoreFlow }
						selectedPages={ selectedPages }
						setSelectedPages={ setSelectedPages }
					/>
				</>
			}
			hideSkip
			align="left"
			isHorizontalLayout
			isWideLayout={ false }
			headerButton={
				<StyledButton
					disabled={ isProductsLoading }
					busy={ isCheckoutButtonBusy }
					primary
					onClick={ submitPickedPages }
				>
					{ translate( 'Go to Checkout' ) }
				</StyledButton>
			}
			headerContent={
				<ShoppingCartForDIFM
					selectedPages={ selectedPages }
					isStoreFlow={ isStoreFlow }
					currentPlanSlug={ currentPlan?.product_slug }
				/>
			}
			{ ...props }
		/>
	);
}

export default function ShoppingCartWrappedPagePicker( props: StepProps ) {
	return (
		<CalypsoShoppingCartProvider>
			<DIFMPagePicker { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
