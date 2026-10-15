import { getJetpackProductDisplayName } from '@automattic/calypso-products';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { getSiteAdminUrl, useCheckoutSite } from '../../hooks/use-checkout-site';
import PrePurchaseNotice from './prepurchase-notice';
import type { Product } from '@automattic/calypso-products';

const getMessage = (
	translate: LocalizeProps[ 'translate' ],
	product: Product,
	siteVersion: number | string | undefined,
	minVersion: number | string
) => {
	const displayName = getJetpackProductDisplayName( product );

	if ( ! siteVersion ) {
		return translate(
			'{{productName/}} requires version {{strong}}%(minVersion)s{{/strong}} of the Jetpack plugin.',
			{
				args: {
					minVersion: minVersion,
				},
				components: {
					productName: <>{ displayName }</>,
					strong: <strong />,
				},
			}
		);
	}

	return translate(
		'{{productName/}} requires version {{strong}}%(minVersion)s{{/strong}} of the Jetpack plugin; your site is using version {{strong}}%(siteVersion)s{{/strong}}.',
		{
			args: {
				minVersion: minVersion,
				siteVersion: siteVersion,
			},
			components: {
				productName: <>{ displayName }</>,
				strong: <strong />,
			},
		}
	);
};

const JetpackPluginRequiredVersionNotice = ( {
	product,
	minVersion,
}: {
	product: Product;
	minVersion: string | number;
} ) => {
	const translate = useTranslate();
	const { data: site } = useCheckoutSite( useSelector( getSelectedSiteId ) );
	const siteJetpackVersion = site?.options?.jetpack_version;
	const pluginUpgradeUrl = getSiteAdminUrl( site, 'update-core.php#update-plugins-table' );

	const message = getMessage( translate, product, siteJetpackVersion, minVersion );

	return (
		<PrePurchaseNotice
			message={ message }
			linkUrl={ pluginUpgradeUrl }
			linkText={ preventWidows( translate( 'Upgrade now' ) ) }
		/>
	);
};

export default JetpackPluginRequiredVersionNotice;
