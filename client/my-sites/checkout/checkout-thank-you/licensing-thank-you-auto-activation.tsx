import page from '@automattic/calypso-router';
import { Button, FormInputValidation, Gridicon, SelectDropdown } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FC, useState, useCallback, useEffect, useMemo } from 'react';
import footerCardImg from 'calypso/assets/images/jetpack/licensing-card.png';
import QueryProducts from 'calypso/components/data/query-products-list';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs, urlToSlug } from 'calypso/lib/url';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import getJetpackCheckoutSupportTicketDestinationSiteId from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-destination-site-id';
import getJetpackCheckoutSupportTicketIncompatibleProductIds from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-incompatible-products';
import getSupportTicketRequestStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';
import getJetpackSites from 'calypso/state/selectors/get-jetpack-sites';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
	source?: string;
	jetpackTemporarySiteId?: number;
	fromSiteSlug?: string;
	redirectTo?: string;
}

type JetpackSite = {
	ID: number;
	URL: string;
	is_wpcom_atomic: boolean;
	products: Product[];
	plan: Product;
	slug: string;
};

type Product = {
	product_id: number;
	product_name: string;
	product_slug: string;
};

interface ProductsList {
	[ P: string ]: Product;
}

const LicensingActivationThankYou: FC< Props > = ( {
	productSlug,
	receiptId = 0,
	source = 'onboarding-calypso-ui',
	jetpackTemporarySiteId = 0,
	fromSiteSlug,
	redirectTo,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);
	const productsList: ProductsList = useSelector( getProductsList );
	const isProductListFetching = useSelector( getIsProductListFetching );
	const userName = useSelector( getCurrentUserName );
	const jetpackSites = useSelector( getJetpackSites ) as JetpackSite[];

	const supportTicketRequestStatus = useSelector( ( state ) =>
		getSupportTicketRequestStatus( state, receiptId )
	);

	const destinationSiteId = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketDestinationSiteId( state, jetpackTemporarySiteId )
	);
	const incompatibleProductIds = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketIncompatibleProductIds( state, jetpackTemporarySiteId )
	);

	const [ selectedSite, setSelectedSite ] = useState( '' );
	const [ error, setError ] = useState< TranslateResult | false >( false );

	const initialSelectedSite = useMemo( () => {
		if ( ! fromSiteSlug ) {
			return '';
		}
		const validSiteThatMatchesFromSiteSlugProp = ( site: JetpackSite ) =>
			site.is_wpcom_atomic === false && site.slug === fromSiteSlug;

		return jetpackSites.find( validSiteThatMatchesFromSiteSlugProp )?.URL || '';
	}, [ jetpackSites, fromSiteSlug ] );

	useEffect( () => {
		setSelectedSite( initialSelectedSite );
	}, [ initialSelectedSite ] );

	const manualActivationUrl = useMemo( () => {
		return addQueryArgs(
			{
				receiptId,
				source,
				jetpackTemporarySiteId,
			},
			`/checkout/jetpack/thank-you/licensing-manual-activate-instructions/${ productSlug }`
		);
	}, [ jetpackTemporarySiteId, productSlug, source, receiptId ] );

	const handleAutoActivate = useCallback(
		( siteUrl: string ) => {
			setError( false );
			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_submit_website_address', {
					product_slug: productSlug,
					site_url: siteUrl,
					receipt_id: receiptId,
				} )
			);
			// Update the support ticket with the submitted site URL(selectedSite) and attempt to
			// transfer the temporary-site subscription to the user's selectedSite.
			dispatch(
				requestUpdateJetpackCheckoutSupportTicket(
					siteUrl,
					receiptId,
					source,
					jetpackTemporarySiteId
				)
			);
		},
		[ dispatch, jetpackTemporarySiteId, productSlug, receiptId, source ]
	);

	const onContinue = useCallback(
		( e: React.MouseEvent ) => {
			e.preventDefault();
			if ( selectedSite === 'activate-license-manually' ) {
				return page( manualActivationUrl );
			}
			handleAutoActivate( selectedSite );
		},
		[ selectedSite, handleAutoActivate, manualActivationUrl ]
	);

	// Prevent auto-activation if it will fail at the initial attempt.
	const [ attemptAutoActivate, setAttemptAutoActivate ] = useState( true );
	useEffect( () => {
		if ( attemptAutoActivate && fromSiteSlug && initialSelectedSite.includes( fromSiteSlug ) ) {
			setAttemptAutoActivate( false );
			handleAutoActivate( initialSelectedSite );
		}
	}, [ attemptAutoActivate, fromSiteSlug, handleAutoActivate, initialSelectedSite ] );

	useEffect( () => {
		if ( error || supportTicketRequestStatus === undefined ) {
			return;
		}
		if ( supportTicketRequestStatus === 'failed' ) {
			return setError(
				translate( 'There was a problem submitting your website address, please try again.' )
			);
		}
		if ( supportTicketRequestStatus === 'success' && destinationSiteId !== undefined ) {
			if ( incompatibleProductIds.length ) {
				const incompatibleProductKey = Object.keys( productsList ).find( ( productKey ) =>
					incompatibleProductIds.includes( productsList[ productKey ].product_id )
				);
				const incompatibleProductName =
					productsList[ incompatibleProductKey as keyof ProductsList ].product_name;
				return setError(
					translate(
						"I'm sorry, you cannot activate %(productName)s on {{strong}}%(selectedSite)s{{/strong}} because that site already has a subscription to %(incompatibleProductName)s.",
						{
							components: {
								strong: <strong />,
							},
							args: {
								productName: productName as string,
								selectedSite: urlToSlug( selectedSite ),
								incompatibleProductName,
							},
						}
					)
				);
			}

			if ( destinationSiteId === 0 ) {
				return setError(
					translate(
						'There was a problem activating %(productName)s on {{strong}}%(selectedSite)s{{/strong}}. Try with a different site or {{a}}activate your product manually{{/a}}.',
						{
							components: {
								strong: <strong />,
								a: <a href={ manualActivationUrl } />,
							},
							args: {
								productName: productName as string,
								selectedSite: urlToSlug( selectedSite ),
							},
						}
					)
				);
			}
			// If the destinationSiteId is greater than 0, then the subscription transfer was successful.
			const thankYouCompletedUrl = addQueryArgs(
				{
					destinationSiteId,
					redirect_to: redirectTo,
				},
				`/checkout/jetpack/thank-you/licensing-auto-activate-completed/${ productSlug }`
			);
			page( thankYouCompletedUrl );
		}
	}, [
		destinationSiteId,
		error,
		incompatibleProductIds,
		manualActivationUrl,
		productName,
		productsList,
		productSlug,
		redirectTo,
		selectedSite,
		supportTicketRequestStatus,
		translate,
	] );

	const siteSelectOptions = useMemo( () => {
		const isProductActivatedOnSite = ( product: Product ) =>
			product && product.product_slug === productSlug;

		return jetpackSites
			.filter( ( site ) => ! site.is_wpcom_atomic )
			.filter(
				( site ) =>
					( ! site.products.some( isProductActivatedOnSite ) &&
						! isProductActivatedOnSite( site.plan ) ) ||
					site.URL === initialSelectedSite
			)
			.map( ( site ) => ( {
				value: site?.URL,
				label: site.URL,
				props: {
					key: site.ID,
					selected: site.URL === selectedSite,
					value: site.URL,
					onClick: () => {
						setSelectedSite( site.URL );
					},
				},
			} ) );
	}, [ jetpackSites, productSlug, initialSelectedSite, selectedSite ] );

	const lastSelectOption = {
		value: 'activate-license-manually',
		label: translate( "I don't see my site. Let me configure it manually" ),
		props: {
			key: 'activate-license-manually',
			selected: 'activate-license-manually' === selectedSite,
			value: 'activate-license-manually',
			onClick: () => {
				setSelectedSite( 'activate-license-manually' );
			},
		},
	};
	const selectDropdownItems = siteSelectOptions && [
		...siteSelectOptions,
		...[ lastSelectOption ],
	];
	const selectedItem = selectDropdownItems.find( ( item ) => item.props.selected );

	return (
		<>
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-auto-activate/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Auto Activation"
			/>
			{ hasProductInfo && <QueryProducts type="jetpack" /> }
			<LicensingActivation
				title={
					source === 'connect-after-checkout' ? (
						<>{ translate( 'Activate your product:' ) }</>
					) : (
						<>
							{ translate( 'Thank you for your purchase!' ) }{ ' ' }
							{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
						</>
					)
				}
				footerImage={ footerCardImg }
				showProgressIndicator
				progressIndicatorValue={ 1 }
				progressIndicatorTotal={ 3 }
				showContactUs
			>
				{ hasProductInfo && ( isProductListFetching || productName ) && (
					<p
						className={
							isProductListFetching
								? 'licensing-thank-you-auto-activation__product-info-loading'
								: 'licensing-thank-you-auto-activation__product-info'
						}
					>
						{ translate( 'Hello %(username)s!', {
							args: {
								username: userName,
							},
						} ) }
						<br />
						{ translate( 'Select the site you want %(productName)s on:', {
							args: {
								productName: productName as string,
							},
						} ) }
					</p>
				) }
				<SelectDropdown
					className="licensing-thank-you-auto-activation__select"
					selectedText={ selectedItem ? selectedItem.label : translate( 'Select…' ) }
				>
					{ selectDropdownItems.map( ( option ) => {
						const { key: itemKey, ...props } = option.props;
						return (
							<SelectDropdown.Item key={ itemKey } { ...props }>
								<div
									className={ clsx(
										'licensing-thank-you-auto-activation__dropdown-item-flex-container',
										{
											'has-seperator': option.value === 'activate-license-manually',
										}
									) }
								>
									<span className="licensing-thank-you-auto-activation__dropdown-item-text">
										{ option.value === 'activate-license-manually' ? (
											<strong>{ option.label }</strong>
										) : (
											option.label
										) }
									</span>
									{ option.value !== 'activate-license-manually' && (
										<span>
											<Gridicon icon="link" size={ 18 } />
										</span>
									) }
								</div>
							</SelectDropdown.Item>
						);
					} ) }
				</SelectDropdown>
				{ error && <FormInputValidation isError={ !! error } text={ error }></FormInputValidation> }
				<Button
					className="licensing-thank-you-auto-activation__button"
					primary
					disabled={ ! selectedSite }
					busy={ supportTicketRequestStatus === 'pending' }
					onClick={ onContinue }
				>
					{ supportTicketRequestStatus === 'pending'
						? translate( 'Working…' )
						: translate( 'Continue' ) }
				</Button>
			</LicensingActivation>
		</>
	);
};

export default LicensingActivationThankYou;
