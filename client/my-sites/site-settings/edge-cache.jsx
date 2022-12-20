import { Button, CompactCard, Spinner } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import QueryEdgeCacheActive from 'calypso/components/data/query-site-edge-cache';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { edgeCacheSetActive, edgeCachePurge } from 'calypso/state/edge-cache/actions';
import { getEdgeCacheActive } from 'calypso/state/selectors/get-edge-cache-active';
import getRequest from 'calypso/state/selectors/get-request';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const EdgeCacheSettings = ( {
	active,
	isGettingActive,
	isPurgingCache,
	isUpdatingActive,
	purgeCache,
	setActive,
	siteId,
	translate,
} ) => {
	const updateActive = () => {
		setActive( siteId, active === 1 ? 0 : 1 );
	};

	const clearCache = () => {
		purgeCache( siteId );
	};

	const getContent = () => {
		if ( isGettingActive ) {
			return;
		}

		return (
			<div className="site-settings__edge-cache-content">
				<ToggleControl
					checked={ active }
					disabled={ isUpdatingActive }
					onChange={ updateActive }
					label={ translate( 'Status' ) }
				></ToggleControl>
				<Button disabled={ isPurgingCache } onClick={ clearCache }>
					{ translate( 'Clear Cache' ) }
				</Button>
			</div>
		);
	};

	return (
		<div className="site-settings__edge-cache">
			<QueryEdgeCacheActive siteId={ siteId } />
			<SettingsSectionHeader
				className="site-settings__edge-cache-title"
				title={ translate( 'Edge Cache' ) }
			/>
			<CompactCard>
				{ getContent() }
				{ isGettingActive && <Spinner /> }
			</CompactCard>
		</div>
	);
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const active = getEdgeCacheActive( state, siteId );
		const isGettingActive = active === null;

		return {
			active,
			isPurgingCache: getRequest( state, edgeCachePurge( siteId ) )?.isLoading ?? false,
			isGettingActive,
			isUpdatingActive: getRequest( state, edgeCacheSetActive( siteId, null ) )?.isLoading ?? false,
			siteId,
		};
	},
	{
		setActive: edgeCacheSetActive,
		purgeCache: edgeCachePurge,
	}
)( localize( EdgeCacheSettings ) );
