import { isFreePlanProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useSelector } from 'react-redux';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export default function DomainUpsell() {
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const isEmailVerified = useSelector( ( state ) => isCurrentUserEmailVerified( state ) );
	const siteDomains = useSelector( ( state ) => getDomainsBySiteId( state, site.ID ) );

	if ( siteDomains.length > 1 || ! isEmailVerified || ! isFreePlanProduct( site.plan ) ) {
		return null;
	}

	const getCtaClickHandler = () => {
		// eslint-disable-next-line no-console
		console.log( 'clicked' );
	};

	const getDismissClickHandler = () => {
		// eslint-disable-next-line no-console
		console.log( 'dismiss' );
	};

	return (
		<div className="domain-upsell" id="domain-upsell">
			<div className="domain-upsell__content">
				<div className="domain-upsell__content-text">
					<Gridicon icon="globe" size={ 16 } className="domain-upsell__icon" />
					<span className="domain-upsell__domain-name">gdemichelisnoplan.wordpress.com</span>
					<button className="domain-upsell__button" onClick={ getCtaClickHandler }>
						Customize your domain
					</button>
					<Gridicon
						icon="cross"
						size={ 16 }
						className="domain-upsell__dismiss-icon"
						onClick={ getDismissClickHandler }
					/>
				</div>
			</div>
		</div>
	);
}
