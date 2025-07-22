import { __ } from '@wordpress/i18n';
import { lockOutline, published } from '@wordpress/icons';
import { launch } from '../../components/icons';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import OverviewCard from '../overview-card';
import type { Site } from '../../data/types';

const CARD_PROPS = {
	title: __( 'Visibility' ),
	trackId: 'visibility',
};

function getVisibilityURL( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return undefined;
	}

	return `/sites/${ site.slug }/settings/site-visibility`;
}

function VisibilityCardUnlaunched() {
	const isSetupComplete = true;
	let heading = __( 'Coming soon' );
	let description = __( 'Finish setting up your site' );

	if ( isSetupComplete ) {
		heading = __( 'Launch site' );
		description = __( 'Ready to go public?' );
	}

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ launch }
			heading={ heading }
			description={ description }
			progress={ {
				value: 5,
				max: 5,
				label: '5/5',
				variant: 'success',
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
			description={ __( 'Ready to go public?' ) }
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
			description={ __( 'Only invited users can view your site' ) }
			link={ getVisibilityURL( site ) }
		/>
	);
}

function VisibilityCardPublic( { site }: { site: Site } ) {
	const description = site.is_wpcom_staging_site
		? __( 'Anyone can view your staging site' )
		: __( 'Anyone can view your site' );

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ published }
			heading={ __( 'Public' ) }
			description={ description }
			link={ getVisibilityURL( site ) }
			variant="success"
		/>
	);
}

export default function VisibilityCard( { site }: { site: Site } ) {
	if ( site.launch_status === 'unlaunched' ) {
		return <VisibilityCardUnlaunched />;
	}

	if ( site.is_coming_soon ) {
		return <VisibilityCardComingSoon site={ site } />;
	}

	if ( site.is_private ) {
		return <VisibilityCardPrivate site={ site } />;
	}

	return <VisibilityCardPublic site={ site } />;
}
