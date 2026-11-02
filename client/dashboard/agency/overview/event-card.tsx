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
import NewTabLabel from '../components/new-tab-label';
import type { FeaturedEvent } from './events';
import type { RecordTracksEvent } from '../tiers/types';

const DESCRIPTION_TAGS = { strong: <strong /> };

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
								{ createInterpolateElement( paragraph, DESCRIPTION_TAGS ) }
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
