import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { addQueryArgs } from 'calypso/lib/url';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { isRequesting, getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { getCustomizerUrl, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './jetpack.scss';

const AmpJetpack = ( {
	ampPluginInstalled,
	customizerAmpPanelUrl,
	requestingPlugins,
	siteId,
	siteSlug,
	translate,
} ) => {
	let linkUrl;
	let linkText;
	if ( ampPluginInstalled && ampPluginInstalled.active ) {
		linkUrl = customizerAmpPanelUrl;
		linkText = translate( 'Edit the design of your Accelerated Mobile Pages' );
	} else {
		linkUrl = '/plugins/amp/' + siteSlug;
		if ( ampPluginInstalled ) {
			linkText = translate( 'Activate the AMP plugin' );
		} else {
			linkText = translate( 'Install the AMP plugin' );
		}
	}

	return (
		<div className="amp__jetpack">
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }

			<SettingsSectionHeader title={ translate( 'Accelerated Mobile Pages (AMP)' ) } />

			<CompactCard>
				<p>
					{ translate(
						'AMP enables the creation of websites and ads that load near instantly, ' +
							'giving site visitors a smooth, more engaging experience on mobile and desktop.'
					) }
				</p>
			</CompactCard>

			{ ! requestingPlugins && customizerAmpPanelUrl && (
				<CompactCard href={ linkUrl }>{ linkText }</CompactCard>
			) }
		</div>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const customizerUrl = getCustomizerUrl( state, siteId );
	const customizerAmpPanelUrl = customizerUrl
		? addQueryArgs(
				{
					'autofocus[panel]': 'amp_panel',
					customize_amp: 1,
				},
				customizerUrl
		  )
		: null;

	return {
		siteId,
		ampPluginInstalled: getPluginOnSite( state, siteId, 'amp' ),
		customizerAmpPanelUrl,
		requestingPlugins: isRequesting( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( AmpJetpack ) );
