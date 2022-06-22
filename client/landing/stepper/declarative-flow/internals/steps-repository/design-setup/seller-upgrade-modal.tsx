import { getPlan, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useThemeDetails } from 'calypso/landing/stepper/hooks/use-theme-details';
import { getPlanPrice } from 'calypso/state/products-list/selectors';
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
	const site = useSite();
	const plan = getPlan( PLAN_WPCOM_PRO );
	const siteId = site?.ID;
	const theme = useThemeDetails( slug );
	const features = theme?.taxonomies?.features;
	const featuresHeading = translate( 'Theme features' ) as string;

	//@todo: Need to get the actual price
	const planPrice = 90 || getPlanPrice( state, siteId, plan, false );

	//@todo: Add Tracks events for viewing and buttons

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
				<h2 className="seller-upgrade-modal__heading">
					{ translate( 'Unlock this premium theme' ) }
				</h2>
				<p>
					{ /* Translators: planPrice is the localized plan price */ }
					{ translate(
						"This theme requires a Pro plan to unlock. It's %(planPrice) a year, risk-free with a 14-day money-back guarantee.",
						{
							args: {
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
				<Button className="seller-upgrade-modal__close" borderless onClick={ () => closeModal() }>
					<Gridicon icon="cross" size={ 12 } />
					<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
				</Button>
				<div className="seller-upgrade-modal__included">
					<h3>{ translate( 'Included with the Pro plan' ) }</h3>
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
			</div>
		</Dialog>
	);
};

export default SellerUpgradeModal;
