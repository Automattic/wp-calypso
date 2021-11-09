import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import page from 'page';
import { FC, useState, useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import footerCardImg from 'calypso/assets/images/jetpack/licensing-card.png';
import QueryProducts from 'calypso/components/data/query-products-list';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import LicensingActivation from 'calypso/components/jetpack/licensing-activation';
import SelectDropdown from 'calypso/components/select-dropdown';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserName } from 'calypso/state/current-user/selectors';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import {
	isProductsListFetching as getIsProductListFetching,
	getProductName,
} from 'calypso/state/products-list/selectors';
import getSupportTicketRequestStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';
import getJetpackSites from 'calypso/state/selectors/get-jetpack-sites';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
	source?: string;
	jetpackTemporarySiteId?: number;
}

type JetpackSite = {
	ID: number;
	URL: string;
};

const LicensingActivationThankYou: FC< Props > = ( {
	productSlug,
	receiptId = 0,
	source = 'onboarding-calypso-ui',
	jetpackTemporarySiteId = 0,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);

	const isProductListFetching = useSelector( ( state ) => getIsProductListFetching( state ) );
	const userName = useSelector( getCurrentUserName );
	const jetpackSites = useSelector( getJetpackSites ) as JetpackSite[];

	const supportTicketRequestStatus = useSelector( ( state ) =>
		getSupportTicketRequestStatus( state, receiptId )
	);

	const [ selectedSite, setSelectedSite ] = useState( '' );
	const [ error, setError ] = useState< TranslateResult | false >( false );

	const onContinue = useCallback(
		( e ) => {
			e.preventDefault();
			if ( selectedSite === 'activate-license-manually' ) {
				const manualActivationUrl = addQueryArgs(
					{
						receiptId,
						source,
						jetpackTemporarySiteId,
					},
					`/checkout/jetpack/thank-you/licensing-manual-activate/${ productSlug }`
				);
				return page( manualActivationUrl );
			}
			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_submit_website_address', {
					product_slug: productSlug,
					site_url: selectedSite,
					receipt_id: receiptId,
				} )
			);
			dispatch(
				requestUpdateJetpackCheckoutSupportTicket(
					selectedSite,
					receiptId,
					source,
					jetpackTemporarySiteId
				)
			);
		},
		[ selectedSite, dispatch, productSlug, receiptId, source, jetpackTemporarySiteId ]
	);

	useEffect( () => {
		if ( supportTicketRequestStatus === 'success' ) {
			const thankYouCompletedUrl = addQueryArgs(
				{
					siteId: jetpackTemporarySiteId,
					receiptId,
				},
				`/checkout/jetpack/thank-you-completed/no-site/${ productSlug }`
			);
			page( thankYouCompletedUrl );
		} else if ( supportTicketRequestStatus === 'failed' ) {
			setError(
				translate( 'There was a problem submitting your website address, please try again.' )
			);
		}
	}, [ jetpackTemporarySiteId, receiptId, supportTicketRequestStatus, productSlug, translate ] );

	const siteSelectOptions = useMemo( () => {
		return jetpackSites.map( ( site: JetpackSite ) => ( {
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
	}, [ jetpackSites, selectedSite ] );

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
				path={ '/checkout/jetpack/thank-you/licensing-auto-activate/:product' }
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Auto Activation"
			/>
			{ hasProductInfo && <QueryProducts type="jetpack" /> }
			<LicensingActivation
				title={
					<>
						{ translate( 'Thank you for your purchase!' ) }{ ' ' }
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</>
				}
				footerImage={ footerCardImg }
				showProgressIndicator={ false }
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
						{ translate( 'Hello %(username)s,', {
							args: {
								username: userName,
							},
						} ) }
						<br />
						{ translate( 'Select the site you want %(productName)s on:', {
							args: {
								productName,
							},
						} ) }
					</p>
				) }
				<SelectDropdown
					className="licensing-thank-you-auto-activation__select"
					selectedText={ selectedItem ? selectedItem.label : translate( 'Select…' ) }
				>
					{ selectDropdownItems.map( ( option ) => (
						<SelectDropdown.Item { ...option.props }>
							<div
								className={ classnames(
									'licensing-thank-you-auto-activation__dropdown-item-flex-container',
									{
										'has-seperator': option.value === 'activate-license-manually',
									}
								) }
							>
								<span className="licensing-thank-you-auto-activation__dropdown-item-text">
									{ option.label }
								</span>
								{ option.value !== 'activate-license-manually' && (
									<span>
										<Gridicon icon="link" size={ 18 } />
									</span>
								) }
							</div>
						</SelectDropdown.Item>
					) ) }
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
