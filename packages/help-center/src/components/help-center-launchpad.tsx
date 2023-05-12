/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SITE_STORE } from '../stores';
import type { SiteSelect } from '@automattic/data-stores';

const getEnvironmentHostname = () => {
	try {
		const currentEnvironment = config( 'env_id' );
		const hostname = config( 'hostname' ) ?? 'wordpress.com';
		const port = config( 'port' );
		switch ( currentEnvironment ) {
			case 'development':
				return `http://${ hostname }${ port ? ':' + port : '' }`;
			default:
				return `https://${ hostname }`;
		}
	} catch ( error ) {
		return 'https://wordpress.com';
	}
};

export const HelpCenterLaunchpad = () => {
	const { __ } = useI18n();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const site = useSelect(
		( select ) => siteId && ( select( SITE_STORE ) as SiteSelect ).getSite( siteId ),
		[ siteId ]
	);
	let siteIntent = site && site?.options?.site_intent;
	let siteSlug = site && new URL( site.URL ).host;

	if ( ! siteIntent || ! siteSlug ) {
		siteIntent = window?.helpCenterData?.currentSite?.site_intent;
		siteSlug = window?.location?.host;
	}

	const { data } = useLaunchpad( siteSlug, siteIntent );
	const totalLaunchpadSteps = data?.checklist?.length || 4;
	const completeLaunchpadSteps =
		data?.checklist?.filter( ( checklistItem ) => checklistItem.completed ).length || 1;

	const launchpadURL = `${ getEnvironmentHostname() }/setup/${ siteIntent }/launchpad?siteSlug=${ siteSlug }`;
	const sectionName = useSelector( ( state ) => getSectionName( state ) );
	const handleLaunchpadHelpLinkClick = () => {
		recordTracksEvent( 'calypso_help_launchpad_click', {
			link: launchpadURL,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	if ( ! siteIntent || ! siteSlug ) {
		return null;
	}
	return (
		<div className="inline-help__launchpad-container">
			<a
				className="inline-help__launchpad-link"
				href={ localizeUrl( launchpadURL ) }
				rel="noreferrer"
				target="_top"
				aria-label="Link to Launchpad screen"
				onClick={ () => {
					handleLaunchpadHelpLinkClick();
				} }
			>
				<CircularProgressBar
					size={ 32 }
					currentStep={ completeLaunchpadSteps }
					numberOfSteps={ totalLaunchpadSteps }
				/>
				<span className="inline-help-launchpad-link-text">
					{ __( 'Continue setting up your site with these next steps.' ) }
				</span>
				<Icon icon={ chevronRight } size={ 24 } />
			</a>
		</div>
	);
};
