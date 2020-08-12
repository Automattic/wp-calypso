/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'lib/formatting';
import { getJetpackProductDisplayName } from 'lib/products-values/get-jetpack-product-display-name';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import getSiteOption from 'state/sites/selectors/get-site-option';
import getSiteAdminUrl from 'state/sites/selectors/get-site-admin-url';

const JetpackMinimumPluginVersionNoticeContent = ( { product, minVersion } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const siteJetpackVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);

	const pluginUpgradeUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'update-core.php#update-plugins-table' )
	);

	const displayName = getJetpackProductDisplayName( product );

	return (
		<div className="checkout__conflict-notice">
			<p className="checkout__conflict-notice-message">
				{ translate(
					'{{productName/}} requires Jetpack version {{strong}}%(minVersion)s{{/strong}}; your site is using version {{strong}}%(siteVersion)s{{/strong}}.',
					{
						args: {
							minVersion: minVersion,
							siteVersion: siteJetpackVersion,
						},
						components: {
							productName: displayName,
							strong: <strong />,
						},
					}
				) }
			</p>
			{ pluginUpgradeUrl && (
				<a className="checkout__conflict-notice-link" href={ pluginUpgradeUrl }>
					{ preventWidows( translate( 'Upgrade now' ) ) }
				</a>
			) }
		</div>
	);
};

export default JetpackMinimumPluginVersionNoticeContent;
