import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CircularProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { useInView } from 'react-intersection-observer';
import { useMyHomeCardLaunchpad } from 'calypso/my-sites/customer-home/cards/launchpad/use-my-home-card-launchpad';
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
	height: '25px',
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

export const SiteLaunchNag = ( { site }: SiteLaunchNagProps ) => {
	const { __ } = useI18n();
	const { ref } = useInView( {
		onChange: ( inView ) => inView && recordNagView(),
	} );

	const checklistSlug = site?.options?.site_intent || 'legacy-site-setup';

	const { numberOfSteps, completedSteps, hasChecklist, isLoading } = useMyHomeCardLaunchpad( {
		checklistSlug,
		launchpadContext: 'sites-dashboard',
		siteId: site.ID,
	} );

	if ( 'unlaunched' !== site.launch_status || ! hasChecklist || isLoading ) {
		return null;
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
