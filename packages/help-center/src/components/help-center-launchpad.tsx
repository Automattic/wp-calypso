/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CircularProgressBar } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { chevronRight, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';
import { getSectionName, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SITE_STORE } from '../stores';

export const HelpCenterLaunchpad = () => {
	const { __ } = useI18n();

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const site = useSelect( ( select ) => siteId && select( SITE_STORE ).getSite( siteId ) );
	const siteIntent = site && site?.options?.site_intent;
	const siteSlug = site && new URL( site.URL ).host;
	const launchpadURL = `https://wordpress.com/setup/${ siteIntent }/launchpad?siteSlug=${ siteSlug }`;
	const sectionName = useSelector( ( state ) => getSectionName( state ) );

	const handleLaunchpadHelpLinkClick = () => {
		recordTracksEvent( 'calypso_help_launchpad_click', {
			link: launchpadURL,
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
		} );
	};

	if ( ! site || ! siteIntent || ! siteSlug ) {
		return null;
	}
	return (
		<div className="inline-help__launchpad-container">
			<a
				className="inline-help__launchpad-link"
				href={ localizeUrl( launchpadURL ) }
				rel="noreferrer"
				aria-label="Link to Launchpad screen"
				onClick={ () => {
					handleLaunchpadHelpLinkClick();
				} }
			>
				<CircularProgressBar currentStep={ 1 } numberOfSteps={ 4 } />
				<span className="inline-help-launchpad-link-text">
					{ __( 'Continue setting up your site with these next steps.' ) }
				</span>
				<Icon icon={ chevronRight } size={ 24 } />
			</a>
		</div>
	);
};
