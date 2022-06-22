import { getPlan, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getPlanPrice } from 'calypso/state/products-list/selectors';
import './seller-upgrade-modal.scss';

const SellerUpgradeModal = () => {
	const translate = useTranslate();
	const site = useSite();
	const plan = getPlan( PLAN_WPCOM_PRO );
	const siteId = site?.ID;

	const planPrice = 90 || getPlanPrice( state, siteId, plan, false );

	return (
		<div className="seller-upgrade-modal">
			<div className="seller-upgrade-modal__col">
				<Gridicon icon="star" />
				<h2 className="seller-upgrade-modal__heading">
					{ translate( 'Unlock this premium theme' ) }
				</h2>
				<div>
					{ /* Translators: planPrice is the localized plan price */ }
					{ translate(
						"This theme requires a Pro plan to unlock. It's %(planPrice) a year, risk-free with a 14-day money-back guarantee.",
						{
							args: {
								planPrice,
							},
						}
					) }
				</div>
				<div className="seller-upgrade-modal__actions">
					<Button>{ translate( 'Cancel' ) }</Button>
					<Button primary>{ translate( 'Buy and activate' ) }</Button>
				</div>
			</div>
			<div className="seller-upgrade-modal__col">
				<Button className="seller-upgrade-modal__button-close">
					<Gridicon icon="close" />
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
				<div className="seller-upgrade-modal__features">
					<h3>{ translate( 'Theme Features' ) }</h3>
					<Badge>{ translate( 'Custom Colors' ) }</Badge>
					<Badge>{ translate( 'Block Editor Styles' ) }</Badge>
					<Badge>{ translate( 'Block Templates' ) }</Badge>
					<Badge>{ translate( 'Featured Images' ) }</Badge>
					<Badge>{ translate( 'Sticky Post' ) }</Badge>
				</div>
			</div>
		</div>
	);
};

export default SellerUpgradeModal;
