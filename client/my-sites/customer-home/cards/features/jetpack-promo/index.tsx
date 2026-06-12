import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getPlanTier } from 'calypso/my-sites/jetpack-overview/feature-data';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

import './style.scss';

export default function JetpackPromo() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const isMaxPlan = getPlanTier( currentPlan?.productSlug ) >= 3;

	function handleClick() {
		recordTracksEvent( 'calypso_jetpack_promo_card_clicked', {
			site_id: siteId,
			site_slug: siteSlug,
		} );
		page( `/jetpack-features/${ siteSlug }` );
	}

	return (
		<Card className="customer-home__card jetpack-promo-card">
			<div className="jetpack-promo-card__content">
				<JetpackLogo size={ 32 } className="jetpack-promo-card__icon" />
				<div className="jetpack-promo-card__text">
					<h3 className="jetpack-promo-card__heading">
						{ isMaxPlan
							? translate( 'Your Jetpack features' )
							: translate( 'Get more from your hosting' ) }
					</h3>
					<p className="jetpack-promo-card__description">
						{ isMaxPlan
							? translate(
									'Your plan includes the full set of Jetpack security, performance, and growth tools.'
							  )
							: translate(
									"Security, performance, and growth tools. See what's active on your site and what you could unlock."
							  ) }
					</p>
				</div>
			</div>
			<Button onClick={ handleClick } className="jetpack-promo-card__button">
				{ translate( 'Explore Jetpack features' ) }
			</Button>
		</Card>
	);
}
