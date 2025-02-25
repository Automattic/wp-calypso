/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSiteSlug } from '../hooks/use-site-slug';

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
	const { sectionName, site } = useHelpCenterContext();
	const siteIntent = site?.options.site_intent;
	const siteSlug = useSiteSlug();

	const { data } = useLaunchpad( siteSlug, siteIntent );
	const totalLaunchpadSteps = data?.checklist?.length || 4;
	const completeLaunchpadSteps =
		data?.checklist?.filter( ( checklistItem ) => checklistItem.completed ).length || 1;

	const launchpadURL = `${ getEnvironmentHostname() }/setup/${ siteIntent }/launchpad?siteSlug=${ siteSlug }`;
	const handleLaunchpadHelpLinkClick = () => {
		recordTracksEvent( 'calypso_help_launchpad_click', {
			link: launchpadURL,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	return (
		<div className="inline-help__launchpad-container">
			<a
				className="inline-help__launchpad-link"
				href={ localizeUrl( launchpadURL ) }
				rel="noreferrer"
				target="_top"
				aria-label={ __( 'Link to Launchpad screen', __i18n_text_domain__ ) }
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
