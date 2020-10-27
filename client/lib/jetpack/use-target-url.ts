/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isJetpackCloudEligible from 'calypso/state/selectors/is-jetpack-cloud-eligible';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Constants
 */
const SOURCE_TO_JETPACK_PATH = {
	'calypso-scanner': '/scan/[site]',
	'calypso-backups': '/backup/[site]',
	'calypso-activity-log': '/backup/activity/[site]',
	'calypso-settings-security': '/settings/jetpack/[site]',
};

const SOURCE_TO_CALYPSO_PATH = {
	'calypso-scanner': '/activity-log/[site]',
	'calypso-backups': '/activity-log/[site]',
	'calypso-activity-log': '/activity-log/[site]',
	'calypso-settings-security': '/settings/security/[site]',
};

interface SourceToPath {
	[ key: string ]: string;
}

export function useTargetUrl( siteId: number | null ) {
	const isCloudEligible = useSelector( ( state ) =>
		isJetpackCloudEligible( state, siteId as number )
	);
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId as number ) );
	const shouldUseJetpackPath = useSelector( ( state ) =>
		isJetpackSectionEnabledForSite( state, siteId )
	);

	const sourceToUrl = ( source: string ): string | null => {
		if ( ! siteId ) {
			return null;
		}
		if ( isCloudEligible ) {
			return `https://jetpack.com/redirect/?source=${ source }&site=${ siteId }`;
		}

		const paths = shouldUseJetpackPath
			? ( SOURCE_TO_JETPACK_PATH as SourceToPath )
			: ( SOURCE_TO_CALYPSO_PATH as SourceToPath );

		if ( ! paths[ source ] ) {
			return source;
		}

		return paths[ source ].replace( '[site]', siteSlug );
	};

	return sourceToUrl;
}

export function useTargetUrlForSelected() {
	const siteId = useSelector( getSelectedSiteId );
	return useTargetUrl( siteId );
}
