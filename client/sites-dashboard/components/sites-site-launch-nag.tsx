import { recordTracksEvent } from '@automattic/calypso-analytics';
import { englishLocales, useLocale } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useInView } from 'react-intersection-observer';
import { getDashboardUrl, getLaunchpadUrl } from '../utils';
import type { SiteExcerptData } from '@automattic/sites';

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
	flexShrink: 0,
	height: '25px',
	zIndex: 0,
} );

const SiteLaunchNagLink = styled.a( {
	display: 'flex',
	alignItems: 'center',
	gap: '25px',
	marginLeft: '-5px',
	fontSize: '12px',
	lineHeight: '16px',
	whiteSpace: 'nowrap',
	color: 'var(--color-link) !important',
} );

const SiteLaunchNagText = styled.span( {
	overflow: 'hidden',
	whiteSpace: 'normal',
	textOverflow: 'ellipsis',
} );

const SiteLaunchDonut = () => {
	return (
		<SiteLaunchDonutContainer>
			<SiteLaunchDonutProgress
				width="25"
				height="25"
				viewBox="0 0 27 27"
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					r="7"
					cx="13.5"
					cy="13.5"
					fill="transparent"
					stroke="#DCDCDE"
					strokeWidth="3"
				></circle>
				<circle
					r="7"
					cx="13.5"
					cy="13.5"
					fill="transparent"
					strokeDashoffset="-32.9823"
					strokeDasharray="43.9823 11"
					stroke="currentColor"
					strokeWidth="3"
				></circle>
			</SiteLaunchDonutProgress>
		</SiteLaunchDonutContainer>
	);
};

const recordNagView = () => {
	recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_inview' );
};

export const SiteLaunchNag = ( { site }: SiteLaunchNagProps ) => {
	const { __, hasTranslation } = useI18n();
	const locale = useLocale();
	const { ref } = useInView( {
		onChange: ( inView ) => inView && recordNagView(),
	} );

	// Don't show nag to all Coming Soon sites, only those that are "unlaunched"
	// That's because sites that have been previously launched before going back to
	// Coming Soon mode don't have a launch checklist.
	if ( 'unlaunched' !== site.launch_status ) {
		return null;
	}

	const validSiteIntent =
		site.options?.launchpad_screen === 'full' &&
		site.options?.site_intent &&
		[ 'link-in-bio' ].includes( site.options.site_intent )
			? site.options.site_intent
			: false;

	const link = validSiteIntent
		? getLaunchpadUrl( site.slug, validSiteIntent )
		: getDashboardUrl( site.slug );
	const checklistTranslation =
		hasTranslation( 'Checklist' ) || englishLocales.includes( locale )
			? __( 'Checklist' )
			: __( 'Launch checklist' );
	const text = validSiteIntent ? __( 'Launch guide' ) : checklistTranslation;

	return (
		<SiteLaunchNagLink
			ref={ ref }
			href={ link }
			onClick={ () => {
				recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_click' );
			} }
		>
			<SiteLaunchDonut /> <SiteLaunchNagText>{ text }</SiteLaunchNagText>
		</SiteLaunchNagLink>
	);
};
