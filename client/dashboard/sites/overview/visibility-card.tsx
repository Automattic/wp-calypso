import { CircularProgressBar } from '@automattic/components';
import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lockOutline, published } from '@wordpress/icons';
import { launch } from '../../components/icons';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import OverviewCard, { OverviewCardWithLink } from '../overview-card';
import { OverviewCardRouterLinkIcon } from '../overview-card/link';
import OverviewCardSummary from '../overview-card/summary';
import type { Site } from '../../data/types';

const CARD_PROPS = {
	title: __( 'Visibility' ),
	trackId: 'visibility',
};

function getVisibilityURL( site: Site ) {
	return `/sites/${ site.slug }/settings/site-visibility`;
}

function VisibilityCardUnlaunched( { site }: { site: Site } ) {
	const isSetupComplete = true;
	let heading = __( 'Coming soon' );
	let description = __( 'Finish setting up your site' );

	if ( isSetupComplete ) {
		heading = __( 'Launch site' );
		description = __( 'Ready to go public?' );
	}

	return (
		<OverviewCardWithLink link={ getVisibilityURL( site ) }>
			<HStack spacing={ 2 }>
				<OverviewCardSummary
					{ ...CARD_PROPS }
					icon={ launch }
					heading={ heading }
					description={ description }
				/>
				<CircularProgressBar
					currentStep={ 5 }
					numberOfSteps={ 5 }
					size={ 80 }
					strokeColor="var(--wp-admin-theme-color)"
					strokeWidth={ 1.5 }
					variant="success"
					customText={
						<Text lineHeight="20px" size={ 15 } weight={ 500 }>
							5/5
						</Text>
					}
				/>
			</HStack>
		</OverviewCardWithLink>
	);
}

function VisibilityCardComingSoon( { site }: { site: Site } ) {
	return (
		<OverviewCardWithLink link={ getVisibilityURL( site ) } tracksId={ CARD_PROPS.trackId }>
			<OverviewCardSummary
				{ ...CARD_PROPS }
				icon={ launch }
				heading={ __( 'Coming soon' ) }
				description={ __( 'Ready to go public?' ) }
				linkIcon={ <OverviewCardRouterLinkIcon /> }
			/>
		</OverviewCardWithLink>
	);
}

function VisibilityCardPrivate( { site }: { site: Site } ) {
	return (
		<OverviewCardWithLink link={ getVisibilityURL( site ) } tracksId={ CARD_PROPS.trackId }>
			<OverviewCardSummary
				{ ...CARD_PROPS }
				icon={ lockOutline }
				heading={ __( 'Private' ) }
				description={ __( 'Only invited users can view your site' ) }
				linkIcon={ <OverviewCardRouterLinkIcon /> }
			/>
		</OverviewCardWithLink>
	);
}

function VisibilityCardPublic( { site }: { site: Site } ) {
	const summaryProps = {
		...CARD_PROPS,
		icon: published,
		heading: __( 'Public' ),
		description: site.is_wpcom_staging_site
			? __( 'Anyone can view your staging site' )
			: __( 'Anyone can view your site' ),
	};

	if ( isSelfHostedJetpackConnected( site ) ) {
		return (
			<OverviewCard tracksId={ CARD_PROPS.trackId } variant="success">
				<OverviewCardSummary { ...summaryProps } />
			</OverviewCard>
		);
	}

	return (
		<OverviewCardWithLink
			link={ getVisibilityURL( site ) }
			tracksId={ CARD_PROPS.trackId }
			variant="success"
		>
			<OverviewCardSummary { ...summaryProps } linkIcon={ <OverviewCardRouterLinkIcon /> } />
		</OverviewCardWithLink>
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
