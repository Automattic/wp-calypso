import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CircularProgressBar } from '@automattic/components';
import { useLaunchpad } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useInView } from 'react-intersection-observer';
import { shouldShowLaunchpadFirst } from 'calypso/state/selectors/should-show-launchpad-first';
import { getDashboardUrl } from '../utils';
import type { SiteExcerptData } from '@automattic/sites';

interface SiteLaunchNagProps {
	site: SiteExcerptData;
}

const SiteLaunchDonutContainer = styled.div( {
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	width: '25px',
	zIndex: 0,
} );

const SiteLaunchNagLink = styled.a( {
	display: 'flex',
	alignItems: 'center',
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

const SiteLaunchDonut = ( {
	numberOfSteps,
	completedSteps,
}: {
	numberOfSteps: number;
	completedSteps: number;
} ) => {
	return (
		<SiteLaunchDonutContainer>
			<CircularProgressBar
				size={ 16 }
				strokeWidth={ 3 }
				enableDesktopScaling={ false }
				showProgressText={ false }
				numberOfSteps={ numberOfSteps }
				currentStep={ completedSteps }
			/>
		</SiteLaunchDonutContainer>
	);
};

const recordNagView = () => {
	recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_inview' );
};

const getChecklistSlug = ( site: SiteExcerptData ) => {
	const intent = site.options?.site_intent;
	const flow = site.options?.site_creation_flow;

	if ( ! intent ) {
		return 'legacy-site-setup';
	}

	const isHostedSite =
		'host-site' === intent || 'new-hosted-site' === flow || 'import-hosted-site' === flow;

	if ( isHostedSite && ! site?.is_wpcom_atomic ) {
		return 'legacy-site-setup';
	}

	return intent;
};

export const SiteLaunchNag = ( { site }: SiteLaunchNagProps ) => {
	const { __ } = useI18n();
	const { ref } = useInView( {
		onChange: ( inView ) => inView && recordNagView(),
	} );

	const {
		data: { checklist },
		isLoading,
	} = useLaunchpad( site.slug, getChecklistSlug( site ), undefined, 'sites-dashboard' );

	if ( 'unlaunched' !== site.launch_status || ! checklist || isLoading ) {
		return null;
	}

	let numberOfSteps = checklist.length || 0;
	let completedSteps = ( checklist.filter( ( task ) => task.completed ) || [] ).length;

	if ( shouldShowLaunchpadFirst( site ) ) {
		// The focused launchpad on My Home doesn't include the launch site task in the count.
		// In which case, we want this donut to match the one on the focused launchpad.
		const launchSiteTask = checklist?.find( ( task ) => task.isLaunchTask );
		const isLaunchSiteTaskComplete = launchSiteTask?.completed;

		numberOfSteps = numberOfSteps - ( launchSiteTask ? 1 : 0 );
		completedSteps = completedSteps - ( isLaunchSiteTaskComplete ? 1 : 0 );
	}

	const link = getDashboardUrl( site.slug );
	const text = __( 'Checklist' );

	return (
		<SiteLaunchNagLink
			ref={ ref }
			href={ link }
			onClick={ () => {
				recordTracksEvent( 'calypso_sites_dashboard_site_launch_nag_click' );
			} }
		>
			<SiteLaunchDonut numberOfSteps={ numberOfSteps } completedSteps={ completedSteps } />
			<SiteLaunchNagText>{ text }</SiteLaunchNagText>
		</SiteLaunchNagLink>
	);
};
