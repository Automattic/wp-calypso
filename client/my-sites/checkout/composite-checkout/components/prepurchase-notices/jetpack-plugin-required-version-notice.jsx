/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import { getJetpackProductDisplayName } from '@automattic/calypso-products';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import PrePurchaseNotice from './prepurchase-notice';

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

const JetpackPluginRequiredVersionNotice = ( { product, minVersion } ) => {
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
		<PrePurchaseNotice
			message={ message }
			linkUrl={ pluginUpgradeUrl }
			linkText={ preventWidows( translate( 'Upgrade now' ) ) }
		/>
	);
};

export default JetpackPluginRequiredVersionNotice;
