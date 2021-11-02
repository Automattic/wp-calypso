import { Button, Card, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import page from 'page';
import { FC, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import footerCardBackground from 'calypso/assets/images/jetpack/jp-licensing-checkout-footer-bg.svg';
import footerCardImg from 'calypso/assets/images/jetpack/licensing-card.png';
import QueryProducts from 'calypso/components/data/query-products-list';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
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
import getJetpackCheckoutSupportTicketStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';
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

const LicensingThankYouAutoActivation: FC< Props > = ( {
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

	const supportTicketStatus = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketStatus( state, receiptId )
	);

	const supportContactLink =
		'https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/';

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
		if ( supportTicketStatus === 'success' ) {
			const thankYouCompletedUrl = addQueryArgs(
				{
					siteId: jetpackTemporarySiteId,
					receiptId,
				},
				`/checkout/jetpack/thank-you-completed/no-site/${ productSlug }`
			);
			page( thankYouCompletedUrl );
		} else if ( supportTicketStatus === 'failed' ) {
			setError(
				translate( 'There was a problem submitting your website address, please try again.' )
			);
		}
	}, [ jetpackTemporarySiteId, receiptId, supportTicketStatus, productSlug, translate ] );

	const siteSelectOptions =
		jetpackSites &&
		jetpackSites.map( ( site: JetpackSite ) => ( {
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
		<Main fullWidthLayout className="licensing-thank-you-auto-activation">
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path={ '/checkout/jetpack/thank-you/licensing/:product' }
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Auto Activation"
			/>
			<Card className="licensing-thank-you-auto-activation__card">
				<div className="licensing-thank-you-auto-activation__card-main">
					<JetpackLogo size={ 45 } />
					{ hasProductInfo && <QueryProducts type="jetpack" /> }
					<h1 className="licensing-thank-you-auto-activation__main-message">
						{ translate( 'Thank you for your purchase!' ) }{ ' ' }
						{ String.fromCodePoint( 0x1f389 ) /* Celebration emoji 🎉 */ }
					</h1>
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
						<SelectDropdown.Separator />
					</SelectDropdown>
					{ error && (
						<FormInputValidation isError={ !! error } text={ error }></FormInputValidation>
					) }
					<Button
						className="licensing-thank-you-auto-activation__button"
						primary
						disabled={ ! selectedSite }
						busy={ supportTicketStatus === 'pending' }
						onClick={ onContinue }
					>
						{ supportTicketStatus === 'pending'
							? translate( 'Working…' )
							: translate( 'Continue' ) }
					</Button>
				</div>
				<div
					className="licensing-thank-you-auto-activation__card-footer"
					style={ { backgroundImage: `url(${ footerCardBackground })` } }
				>
					<div className="licensing-thank-you-auto-activation__card-footer-image">
						<img src={ footerCardImg } alt="Checkout Thank you" />
					</div>
					<div className="licensing-thank-you-auto-activation__card-footer-text">
						{ translate( 'Do you need help? {{a}}Contact us{{/a}}.', {
							components: {
								a: <a href={ supportContactLink } target="_blank" rel="noopener noreferrer" />,
							},
						} ) }
					</div>
				</div>
			</Card>
		</Main>
	);
};

export default LicensingThankYouAutoActivation;
