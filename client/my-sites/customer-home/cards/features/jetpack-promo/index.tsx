import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function JetpackPromo() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );

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
						{ translate( 'Get more from your hosting' ) }
					</h3>
					<p className="jetpack-promo-card__description">
						{ translate(
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
