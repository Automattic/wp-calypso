import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useThemeDetails } from 'calypso/landing/stepper/hooks/use-theme-details';
import { PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import ThemeFeatures from './theme-features';
import './upgrade-modal.scss';

interface UpgradeModalProps {
	/* Theme slug */
	slug: string;
	isOpen: boolean;
	closeModal: () => void;
	checkout: () => void;
}

interface UpgradeModalContent {
	header: JSX.Element;
	text: JSX.Element;
	price: JSX.Element | null;
	action: JSX.Element;
}

const UpgradeModal = ( { slug, isOpen, closeModal, checkout }: UpgradeModalProps ) => {
	const translate = useTranslate();
	const theme = useThemeDetails( slug );
	const features = theme.data && theme.data.taxonomies.theme_feature;
	const featuresHeading = translate( 'Theme features' ) as string;
	// Check current theme: Does it have a plugin bundled?
	const theme_software_set = theme?.data?.taxonomies?.theme_software_set?.length;
	const showBundleVersion = isEnabled( 'themes/plugin-bundling' ) && theme_software_set;

	const premiumPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'value_bundle' )
	);
	const businessPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'business-bundle' )
	);

	let themePrice;
	if ( showBundleVersion ) {
		themePrice = businessPlanProduct?.combined_cost_display;
	} else {
		themePrice = premiumPlanProduct?.combined_cost_display;
	}

	//Wait until we have theme and product data to show content
	const isLoading = ! themePrice || ! theme.data;

	// TODO: This is placeholder logic for determining whether the theme is a third party premium theme
	// change to "true" to test
	const isThirdParty = true;

	const getStandardPurchaseModalData = (): UpgradeModalContent => {
		return {
			header: (
				<h1 className="upgrade-modal__heading">{ translate( 'Unlock this premium theme' ) }</h1>
			),
			text: (
				<p>
					{ translate(
						'You can purchase a subscription to use this theme or join the Premium plan to get it for free.'
					) }
				</p>
			),
			price: (
				<div className="upgrade-modal__theme-price">
					{ translate( '{{span}}%(themePrice)s{{/span}} per year', {
						components: {
							span: <span />,
						},
						args: {
							themePrice,
						},
					} ) }
				</div>
			),
			action: (
				<>
					<div className="upgrade-modal__actions">
						<Button className="upgrade-modal__upgrade" primary onClick={ () => checkout() }>
							{ translate( 'Buy and activate theme' ) }
						</Button>
					</div>
					<p className="upgrade-modal__plan-nudge">
						{ translate( 'or get it for free when on the {{button}}Premium plan{{/button}}', {
							components: {
								button: <Button onClick={ () => checkout() } plain />,
							},
						} ) }
					</p>
				</>
			),
		};
	};

	const getBundledFirstPartyPurchaseModalData = (): UpgradeModalContent => {
		return {
			header: (
				<>
					<img src={ wooCommerceImage } alt="WooCommerce" className="upgrade-modal__woo-logo" />
					<h1 className="upgrade-modal__heading bundle">
						{ translate( 'Unlock this WooCommerce theme' ) }
					</h1>
				</>
			),
			text: (
				<p>
					{ translate(
						"This theme comes bundled with {{link}}WooCommerce{{/link}} plugin. Upgrade to a Business plan to select this theme and unlock all its features. It's %s per year with a 14-day money-back guarantee.",
						{
							components: {
								link: <ExternalLink target="_blank" href="https://woocommerce.com/" />,
							},
							args: themePrice,
						}
					) }
				</p>
			),
			price: null,
			action: (
				<div className="upgrade-modal__actions bundle">
					<Button className="upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
						{ translate( 'Upgrade Plan' ) }
					</Button>
				</div>
			),
		};
	};

	const getThirdPartyPurchaseModalData = (): UpgradeModalContent => {
		return {
			header: (
				<>
					<h1 className="upgrade-modal__heading bundle">{ translate( 'Upgrade to Buy' ) }</h1>
				</>
			),
			text: (
				<>
					<p>
						{ translate(
							'This premium theme is only available to buy on the Business or eCommerce plans.'
						) }
					</p>
					<p>
						<strong>To activate this theme, you need:</strong>
					</p>
				</>
			),
			price: (
				<>
					<table className="upgrade-modal__product-list">
						<tr className="upgrade-modal__product-list-item">
							<td className="upgrade-modal__product-list-product">{ theme?.data?.name }</td>
							<td className="upgrade-modal__product-list-price">
								<strong>{ translate( '%s per year', { args: themePrice } ) }</strong>
							</td>
						</tr>
						<tr className="upgrade-modal__product-list-item">
							<td className="upgrade-modal__product-list-product">
								{ translate( 'Business plan' ) }
							</td>
							{ /* TODO: Figure out how to fetch this info  */ }
							<td className="upgrade-modal__product-list-price">
								<strong>{ translate( '%s per year', { args: 'TBD' } ) }</strong>
							</td>
						</tr>
					</table>
				</>
			),
			action: (
				<div className="upgrade-modal__actions bundle">
					<Button className="upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			),
		};
	};

	let modalData = null;

	if ( isThirdParty ) {
		modalData = getThirdPartyPurchaseModalData();
	} else if ( showBundleVersion ) {
		modalData = getBundledFirstPartyPurchaseModalData();
	} else {
		modalData = getStandardPurchaseModalData();
	}

	return (
		<Dialog
			className={ classNames( 'upgrade-modal', { loading: isLoading } ) }
			isVisible={ isOpen }
			onClose={ () => closeModal() }
			isFullScreen
		>
			{ isLoading && <LoadingEllipsis /> }
			{ ! isLoading && (
				<>
					<div className="upgrade-modal__col">
						{ modalData.header }
						{ modalData.text }
						{ modalData.price }
						{ modalData.action }
					</div>
					<div className="upgrade-modal__col">
						<div className="upgrade-modal__included">
							<h2>{ translate( 'Included with your purchase' ) }</h2>
							<ul>
								<li className="upgrade-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Best-in-class hosting' ) }
								</li>
								<li className="upgrade-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Dozens of free themes' ) }
								</li>
								<li className="upgrade-modal__included-item">
									<Gridicon icon="checkmark" size={ 16 } />
									{ translate( 'Unlimited customer support via email' ) }
								</li>
							</ul>
						</div>
						{ features && <ThemeFeatures features={ features } heading={ featuresHeading } /> }
					</div>
					<Button className="upgrade-modal__close" borderless onClick={ () => closeModal() }>
						<Gridicon icon="cross" size={ 12 } />
						<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
					</Button>
				</>
			) }
		</Dialog>
	);
};

export default UpgradeModal;
