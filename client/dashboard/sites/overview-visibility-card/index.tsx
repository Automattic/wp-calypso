import { siteLaunchpadQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { lockOutline, published } from '@wordpress/icons';
import { launch } from '../../components/icons';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import OverviewCard from '../overview-card';
import type { Site } from '@automattic/api-core';

const CARD_PROPS = {
	title: __( 'Visibility' ),
	trackId: 'site-overview-visibility',
};

function getVisibilityURL( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return undefined;
	}

	return `/sites/${ site.slug }/settings/site-visibility`;
}

function getLaunchpadChecklistSlug( site: Site ) {
	const intent = site.options?.site_intent;
	if ( ! intent ) {
		return 'legacy-site-setup';
	}

	const flow = site.options?.site_creation_flow ?? '';
	const isHostedSite = [ 'host-site', 'new-hosted-site', 'import-hosted-site' ].includes( flow );

	if ( isHostedSite && ! site?.is_wpcom_atomic ) {
		return 'legacy-site-setup';
	}

	return intent;
}

function VisibilityCardUnlaunched( { site }: { site: Site } ) {
	const { data: launchpad } = useQuery(
		siteLaunchpadQuery( site.ID, getLaunchpadChecklistSlug( site ) )
	);

	const tasks = launchpad?.checklist ?? [];
	const numberOfTasks = tasks.length;
	const completedTasks = tasks.filter( ( task ) => task.completed ).length;
	const isLaunchpadCompleted = completedTasks && completedTasks === numberOfTasks;

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ launch }
			{ ...( isLaunchpadCompleted
				? {
						heading: __( 'Launch site' ),
						description: __( 'Ready to go public?' ),
						link: getVisibilityURL( site ),
				  }
				: {
						heading: __( 'Coming soon' ),
						description: __( 'Finish setting up your site.' ),
						externalLink: `/home/${ site.slug }`,
				  } ) }
			progress={ {
				value: completedTasks,
				max: numberOfTasks,
				label: `${ completedTasks }/${ numberOfTasks }`,
				...( isLaunchpadCompleted && { variant: 'success' } ),
			} }
		/>
	);
}

function VisibilityCardComingSoon( { site }: { site: Site } ) {
	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ launch }
			heading={ __( 'Coming soon' ) }
			description={
				site.is_wpcom_staging_site
					? __( 'Visitors will see a coming soon page.' )
					: __( 'Ready to go public?' )
			}
			link={ getVisibilityURL( site ) }
		/>
	);
}

function VisibilityCardPrivate( { site }: { site: Site } ) {
	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ lockOutline }
			heading={ __( 'Private' ) }
			description={ __( 'Only invited users can view your site.' ) }
			link={ getVisibilityURL( site ) }
		/>
	);
}

function VisibilityCardPublic( { site }: { site: Site } ) {
	const description = site.is_wpcom_staging_site
		? __( 'Anyone can view your staging site.' )
		: __( 'Anyone can view your site.' );

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ published }
			heading={ __( 'Public' ) }
			description={ description }
			link={ getVisibilityURL( site ) }
			intent="success"
		/>
	);
}

export default function VisibilityCard( { site }: { site: Site } ) {
	if ( site.launch_status === 'unlaunched' ) {
		return <VisibilityCardUnlaunched site={ site } />;
	}

	if ( site.is_coming_soon ) {
		return <VisibilityCardComingSoon site={ site } />;
	}

	if ( site.is_private ) {
		return <VisibilityCardPrivate site={ site } />;
	}

	return <VisibilityCardPublic site={ site } />;
}
