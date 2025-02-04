import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import appsImage from 'calypso/assets/images/illustrations/apps.svg';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { addQueryArgs } from 'calypso/lib/route';

const noop = () => {};

export default localize( ( { translate, onClick = noop } ) => {
	return (
		<div className="product-purchase-features-list__item">
			<PurchaseDetail
				icon={ <img alt="" src={ appsImage } /> }
				title={ translate( 'Download our mobile apps' ) }
				description={ translate(
					'Manage all your sites from a single dashboard: publish content, ' +
						'track stats, moderate comments, and more.'
				) }
				buttonText={ translate( 'Get the apps' ) }
				href={ addQueryArgs(
					{
						utm_source: 'calypsomyplan',
						utm_medium: 'cta',
						utm_campaign: 'calypsogetappscard',
					},
					localizeUrl( 'https://apps.wordpress.com/get?' )
				) }
				target="_blank"
				onClick={ onClick }
			/>
		</div>
	);
} );
