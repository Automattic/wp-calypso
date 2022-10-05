import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { getDashboardUrl, getLaunchpadUrl } from '../utils';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteLaunchNagProps {
	site: SiteExcerptData;
}

const SiteLaunchDonutBase = styled.svg( {
	position: 'absolute',
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
} );

const SiteLaunchDonutProgress = styled( SiteLaunchDonutBase )( {
	zIndex: 1,
} );

const SiteLaunchDonutContainer = styled.div( {
	position: 'relative',
	width: '13px',
	marginTop: '3px',
	marginRight: '4px',
} );

const SiteLaunchNagLink = styled.a( {
	display: 'flex',
	fontSize: '12px',
	lineHeight: '20px',
	whiteSpace: 'nowrap',
	'&:hover span': {
		textDecoration: 'underline',
	},
} );

const SiteLaunchDonut = () => {
	return (
		<SiteLaunchDonutContainer>
			<SiteLaunchDonutProgress viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M0 13.5C0 20.6797 5.8203 26.5 13 26.5C20.1797 26.5 26 20.6797 26 13.5C26 6.3203 20.1797 0.5 13 0.5V2.5C19.0751 2.5 24 7.42487 24 13.5C24 19.5751 19.0751 24.5 13 24.5C6.92487 24.5 2 19.5751 2 13.5H0Z"
					fill="currentColor"
				/>
			</SiteLaunchDonutProgress>
			<SiteLaunchDonutBase viewBox="0 0 26 27" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="13" cy="13.5" r="12" stroke="#DCDCDE" strokeWidth="2" />
			</SiteLaunchDonutBase>
		</SiteLaunchDonutContainer>
	);
};

export const SiteLaunchNag = ( { site }: SiteLaunchNagProps ) => {
	const { __ } = useI18n();
	const { ref, inView } = useInView();

	useEffect( () => {
		if ( inView ) {
			recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_inview' );
		}
	}, [ inView ] );

	// Don't show nag to all Coming Soon sites, only those that are "unlaunched"
	// That's because sites that have been previously launched before going back to
	// Coming Soon mode don't have a launch checklist.
	if ( 'unlaunched' !== site.launch_status ) {
		return null;
	}

	const validSiteIntent =
		site.options?.site_intent && -1 !== [ 'link-in-bio' ].indexOf( site.options?.site_intent )
			? site.options?.site_intent
			: false;

	const link = validSiteIntent
		? getLaunchpadUrl( site.slug, validSiteIntent )
		: getDashboardUrl( site.slug );
	const text = site.options?.site_intent ? __( 'Launch guide' ) : __( 'Launch checklist' );
	return (
		<SiteLaunchNagLink
			ref={ ref }
			href={ link }
			onClick={ () => {
				recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_click' );
			} }
		>
			<SiteLaunchDonut /> <span>{ text }</span>
		</SiteLaunchNagLink>
	);
};
