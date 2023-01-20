import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import i18n, { useTranslate } from 'i18n-calypso';
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
	const currentLocale = i18n.getLocaleSlug();
	const theme = useThemeDetails( slug );
	const features = theme.data && theme.data.taxonomies.theme_feature;
	const featuresHeading = translate( 'Theme features' ) as string;
	// Check current theme: Does it have a plugin bundled?
	const theme_software_set = theme?.data?.taxonomies?.theme_software_set?.length;
	const showBundleVersion = theme_software_set;

	const premiumPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'value_bundle' )
	);
	const businessPlanProduct = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'business-bundle' )
	);

	//Wait until we have theme and product data to show content
	const isLoading = ! premiumPlanProduct || ! businessPlanProduct || ! theme.data;

	// TODO: This is placeholder logic for determining whether the theme is a third party premium theme
	// Change `false` to `true` in order to test this UI with any premium theme's upgrade modal.
	const isThirdParty = isEnabled( 'themes/subscription-purchases' ) || false;

	const getStandardPurchaseModalData = (): UpgradeModalContent => {
		const planName = premiumPlanProduct?.product_name;
		const planPrice = premiumPlanProduct?.combined_cost_display;

		return {
			header: (
				<h1 className="upgrade-modal__heading">{ translate( 'Unlock this premium theme' ) }</h1>
			),
			text: (
				<p>
					{ currentLocale === 'en' ||
					currentLocale?.startsWith( 'en-' ) ||
					i18n.hasTranslation(
						"Get access to our Premium themes, and a ton of other features, with a subscription to the Premium plan. It's {{strong}}%s{{/strong}} a year, risk-free with a 14-day money-back guarantee."
					)
						? translate(
								"Get access to our Premium themes, and a ton of other features, with a subscription to the Premium plan. It's {{strong}}%s{{/strong}} a year, risk-free with a 14-day money-back guarantee.",
								{
									components: {
										strong: <strong />,
									},
									args: planPrice,
								}
						  )
						: translate(
								"This theme requires %(planName)s to unlock. It's %(planPrice)s a year, risk-free with a 14-day money-back guarantee.",
								{
									args: {
										planName,
										planPrice,
									},
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
						{ translate( 'Upgrade to activate' ) }
					</Button>
				</div>
			),
		};
	};

	const getBundledFirstPartyPurchaseModalData = (): UpgradeModalContent => {
		const businessPlanPrice = businessPlanProduct?.combined_cost_display;
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
							args: businessPlanPrice,
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
		const themePrice = premiumPlanProduct?.combined_cost_display;
		const businessPlanPrice = businessPlanProduct?.combined_cost_display;
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
							<td className="upgrade-modal__product-list-price">
								<strong>{ translate( '%s per year', { args: businessPlanPrice } ) }</strong>
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
