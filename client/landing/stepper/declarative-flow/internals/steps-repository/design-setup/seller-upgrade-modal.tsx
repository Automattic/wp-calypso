import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useThemeDetails } from 'calypso/landing/stepper/hooks/use-theme-details';
import { PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import ThemeFeatures from './theme-features';
import './seller-upgrade-modal.scss';

interface SellerUpgradeModalProps {
	/* Theme slug */
	slug: string;
	isOpen: boolean;
	closeModal: () => void;
	checkout: () => void;
}

const SellerUpgradeModal = ( { slug, isOpen, closeModal, checkout }: SellerUpgradeModalProps ) => {
	const translate = useTranslate();
	const theme = useThemeDetails( slug );
	const features = theme.data && theme.data.taxonomies.features;
	const featuresHeading = translate( 'Theme features' ) as string;
	const plan = useSelect( ( select ) =>
		select( PRODUCTS_LIST_STORE ).getProductBySlug( 'pro-plan' )
	);
	const planName = plan?.product_name;
	const planPrice = plan?.combined_cost_display;

	return (
		<Dialog
			className="seller-upgrade-modal"
			isVisible={ isOpen }
			onClose={ () => closeModal() }
			isFullScreen
		>
			<div className="seller-upgrade-modal__col">
				<div className="seller-upgrade-modal__star-box">
					<Gridicon icon="star" size={ 24 } />
				</div>
				<h1 className="seller-upgrade-modal__heading">
					{ translate( 'Unlock this premium theme' ) }
				</h1>
				<p>
					{ /* Translators: planName is the name of the plan, planPrice is the plan price in the user's currency */ }
					{ translate(
						"This theme requires %(planName)s to unlock. It's %(planPrice)s a year, risk-free with a 14-day money-back guarantee.",
						{
							args: {
								planName,
								planPrice,
							},
						}
					) }
				</p>
				<div className="seller-upgrade-modal__actions">
					<Button className="seller-upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="seller-upgrade-modal__upgrade" primary onClick={ () => checkout() }>
						{ translate( 'Upgrade plan' ) }
					</Button>
				</div>
			</div>
			<div className="seller-upgrade-modal__col">
				<div className="seller-upgrade-modal__included">
					<h2>
						{ /* Translators: planName is the name of the plan */ }
						{ translate( 'Included with %(planName)s', {
							args: {
								planName,
							},
						} ) }
					</h2>
					<ul>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Best-in-class hosting' ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Access to premium themes' ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( "Access to 1000's of plugins" ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="checkmark" size={ 16 } />
							{ translate( 'Unlimited support' ) }
						</li>
					</ul>
				</div>
				<ThemeFeatures features={ features } heading={ featuresHeading } />
			</div>
			<Button className="seller-upgrade-modal__close" borderless onClick={ () => closeModal() }>
				<Gridicon icon="cross" size={ 12 } />
				<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
			</Button>
		</Dialog>
	);
};

export default SellerUpgradeModal;
