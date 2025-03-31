import { localize } from 'i18n-calypso';
import HeaderCake from 'calypso/components/header-cake';
import { Purchase } from 'calypso/lib/purchases/types';
import PurchaseSiteHeader from 'calypso/me/purchases/purchases-site/header';
import titles from 'calypso/me/purchases/titles';
import SupportLink from '../cancel-purchase-support-link/support-link';

type Props = {
	siteId: number;
	name: string;
	purchase: Purchase;
};

const DowngradePlaceholder = ( { siteId, name, purchase }: Props ) => {
	return (
		<div className="downgrade-placeholder">
			<HeaderCake backHref="">{ titles.downgradeSubscription( '' ) }</HeaderCake>
			<PurchaseSiteHeader siteId={ siteId } name={ name } purchase={ purchase } />

			<div className="card downgrade__wrapper-card">
				<div className="downgrade__inner-wrapper">
					<div className="downgrade__content">
						<div className="downgrade__title"></div>
						<div className="downgrade__subtitle"></div>
					</div>
					<div className="downgrade__features">
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
						<div className="downgrade__feature"></div>
					</div>
					<div className="downgrade__confirm-buttons">
						<div className="downgrade__confirm-button"></div>
						<div className="downgrade__cancel-button"></div>
					</div>

					{ purchase && <SupportLink usage="downgrade" purchase={ purchase } /> }
				</div>
			</div>
		</div>
	);
};

export default localize( DowngradePlaceholder );
