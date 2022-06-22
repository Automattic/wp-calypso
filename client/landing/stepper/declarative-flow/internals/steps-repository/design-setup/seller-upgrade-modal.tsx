import { getPlan, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Modal from 'react-modal';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useThemeDetails } from 'calypso/landing/stepper/hooks/use-theme-details';
import { getPlanPrice } from 'calypso/state/products-list/selectors';
import ThemeFeatures from './theme-features';
import './seller-upgrade-modal.scss';

interface SellerUpgradeModalProps {
	/* Theme slug */
	slug: string;
}

const SellerUpgradeModal: React.FC< SellerUpgradeModalProps > = ( { slug } ) => {
	const translate = useTranslate();
	const site = useSite();
	const plan = getPlan( PLAN_WPCOM_PRO );
	const siteId = site?.ID;
	const theme = useThemeDetails( slug );
	const features = theme.taxonomies.features;
	const featuresHeading = translate( 'Theme features' ) as string;

	//@todo: Need to get the actual price
	const planPrice = 90 || getPlanPrice( state, siteId, plan, false );

	//@todo: Add Tracks events for viewing and buttons

	return (
		<Modal className="seller-upgrade-modal" isOpen>
			<div className="seller-upgrade-modal__col">
				<Gridicon icon="star" />
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
					<Button onClick={ () => null }>{ translate( 'Cancel' ) }</Button>
					<Button primary onClick={ () => null }>
						{ translate( 'Buy and activate' ) }
					</Button>
				</div>
			</div>
			<div className="seller-upgrade-modal__col">
				<Button className="seller-upgrade-modal__button-close" onClick={ () => null }>
					<Gridicon icon="cross" />
				</Button>
				<div className="seller-upgrade-modal__included">
					<h3>{ translate( 'Included with the Pro plan' ) }</h3>
					<ul>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="check" />
							{ translate( 'Best-in-class hosting' ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="check" />
							{ translate( 'Access to premium themes' ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="check" />
							{ translate( "Access to 1000's of plugins" ) }
						</li>
						<li className="seller-upgrade-modal__included-item">
							<Gridicon icon="check" />
							{ translate( 'Unlimited support' ) }
						</li>
					</ul>
				</div>
				<ThemeFeatures heading={ featuresHeading } features={ features } />
			</div>
		</Modal>
	);
};

export default SellerUpgradeModal;
