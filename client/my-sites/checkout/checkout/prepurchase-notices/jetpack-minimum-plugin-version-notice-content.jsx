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

const getMessage = ( translate, product, siteVersion, minVersion ) => {
	const displayName = getJetpackProductDisplayName( product );

	if ( ! siteVersion ) {
		return translate(
			'{{productName/}} requires version {{strong}}%(minVersion)s{{/strong}} of the Jetpack plugin.',
			{
				args: {
					minVersion: minVersion,
				},
				components: {
					productName: displayName,
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
				productName: displayName,
				strong: <strong />,
			},
		}
	);
};

const JetpackMinimumPluginVersionNoticeContent = ( { product, minVersion } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const siteJetpackVersion = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'jetpack_version' )
	);

	const pluginUpgradeUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'update-core.php#update-plugins-table' )
	);

	const message = getMessage( translate, product, siteJetpackVersion, minVersion );

	return (
		<div className="jetpack-minimum-plugin-version-notice-content">
			<p className="jetpack-minimum-plugin-version-notice-content__message">{ message }</p>
			{ pluginUpgradeUrl && (
				<a
					className="jetpack-minimum-plugin-version-notice-content__link"
					href={ pluginUpgradeUrl }
				>
					{ preventWidows( translate( 'Upgrade now' ) ) }
				</a>
			) }
		</div>
	);
};

export default JetpackMinimumPluginVersionNoticeContent;
