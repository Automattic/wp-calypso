import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { Fragment } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import { isDashboardPath } from '../../utils/link';
import CertificationShareButton from '../certification/share-button';
import NewTabLabel from '../components/new-tab-label';
import {
	FEATURED_EVENT,
	getAiMcpAnnouncement,
	getCertificationPromoEvent,
	getPressableExpansionOfferEvent,
	getPressableIntroOfferEvent,
} from './events';
import type { FeaturedEvent, FeaturedEventActionCta } from './events';
import type { RecordTracksEvent } from '../tiers/types';

interface EventCardProps {
	isEligibleForPressableIntroOffer?: boolean;
	isEligibleForPressableExpansionOffer?: boolean;
	isEligibleForCertificationOffer?: boolean;
	certificationOffer?: {
		/** The agency's own discount, already doubled while the offer runs. */
		discount: number;
		/** What "Share with your team" puts on the clipboard. */
		shareMessage: string;
	};
	onCertificationShareCopy?: () => void;
	aiMcpHref: string;
	tiersHref?: string;
	pressableHostingHref: string;
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

export function SingleEventCard( {
	event,
	shouldUseRouterLink,
	recordTracksEvent,
}: {
	event: FeaturedEvent;
	shouldUseRouterLink: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const { id, logo, logoAlt, when, title, subtitle, description, ctas } = event;
	const isMobileViewport = useViewportMatch( 'mobile', '<' );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 3 } justify="flex-start" alignment="center">
						{ logo && <img src={ logo } alt={ logoAlt ?? '' } width={ 64 } height={ 64 } /> }
						<VStack spacing={ 1 }>
							{ when && (
								<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
									{ when }
								</Text>
							) }
							<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
								{ title }
							</Heading>
							{ subtitle && (
								<Text variant="muted" size={ 12 } lineHeight="16px">
									{ subtitle }
								</Text>
							) }
						</VStack>
					</HStack>
					<VStack spacing={ 4 }>
						{ description.map( ( paragraph ) => (
							<Text key={ paragraph } size={ 13 } lineHeight="20px">
								{ createInterpolateElement( paragraph, {
									strong: <strong />,
									// Calypso's global `code` rule sets its own size and weight.
									code: (
										<code
											style={ {
												fontSize: 'inherit',
												fontWeight: 'inherit',
												lineHeight: 'inherit',
											} }
										/>
									),
								} ) }
							</Text>
						) ) }
					</VStack>
					<ButtonStack justify="flex-start" wrap>
						{ ctas.map( ( cta ) => {
							const trackClick = () =>
								recordTracksEvent?.( 'calypso_a4a_overview_event_cta_click', {
									event_id: id,
									cta_id: cta.id,
								} );
							const style = isMobileViewport
								? { width: '100%', justifyContent: 'center' }
								: undefined;
							if ( 'render' in cta ) {
								return (
									<Fragment key={ cta.id }>
										{ cta.render( {
											size: 'compact',
											variant: 'secondary',
											style,
											onClick: trackClick,
										} ) }
									</Fragment>
								);
							}
							const buttonProps = {
								size: 'compact' as const,
								variant: cta.variant ?? ( 'secondary' as const ),
								style,
								onClick: () => {
									trackClick();
									if ( cta.legacyTrackEventName ) {
										recordTracksEvent?.( cta.legacyTrackEventName );
									}
								},
							};
							if ( shouldUseRouterLink && ! cta.isExternal && isDashboardPath( cta.url ) ) {
								// The router takes the hash separately; left in `to`, it is dropped.
								const [ to, hash ] = cta.url.split( '#' );
								return (
									<RouterLinkButton key={ cta.id } { ...buttonProps } to={ to } hash={ hash }>
										{ cta.label }
									</RouterLinkButton>
								);
							}
							return (
								<Button
									key={ cta.id }
									{ ...buttonProps }
									href={ cta.url }
									target={ cta.isExternal ? '_blank' : undefined }
									rel={ cta.isExternal ? 'noreferrer' : undefined }
								>
									{ cta.isExternal ? <NewTabLabel>{ cta.label }</NewTabLabel> : cta.label }
								</Button>
							);
						} ) }
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function EventCard( {
	isEligibleForPressableIntroOffer,
	isEligibleForPressableExpansionOffer,
	isEligibleForCertificationOffer,
	certificationOffer,
	onCertificationShareCopy,
	aiMcpHref,
	tiersHref,
	pressableHostingHref,
	shouldUseRouterLink = true,
	recordTracksEvent,
}: EventCardProps ) {
	const now = new Date();
	const certificationShareCta: FeaturedEventActionCta | undefined = certificationOffer && {
		id: 'share-with-your-team',
		render: ( buttonProps ) => (
			<CertificationShareButton
				{ ...buttonProps }
				message={ certificationOffer.shareMessage }
				source="overview"
				onCopy={ onCertificationShareCopy }
				recordTracksEvent={ recordTracksEvent }
			/>
		),
	};
	const events = [
		FEATURED_EVENT,
		isEligibleForCertificationOffer && tiersHref && certificationOffer
			? getCertificationPromoEvent( tiersHref, certificationOffer.discount, certificationShareCta )
			: null,
		isEligibleForPressableIntroOffer ? getPressableIntroOfferEvent( pressableHostingHref ) : null,
		isEligibleForPressableExpansionOffer
			? getPressableExpansionOfferEvent( pressableHostingHref )
			: null,
		getAiMcpAnnouncement( aiMcpHref ),
	].filter(
		( event ): event is FeaturedEvent =>
			!! event && ( event.endsAt === undefined || now < new Date( event.endsAt ) )
	);

	if ( ! events.length ) {
		return null;
	}

	return (
		<>
			{ events.map( ( event ) => (
				<SingleEventCard
					key={ event.id }
					event={ event }
					shouldUseRouterLink={ shouldUseRouterLink }
					recordTracksEvent={ recordTracksEvent }
				/>
			) ) }
		</>
	);
}
