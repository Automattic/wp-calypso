import {
	Button,
	SelectControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { getQueryArgs } from '@wordpress/url';
import { useState, useMemo } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import Grid from '../../../components/grid';
import RouterLinkButton from '../../../components/router-link-button';
import { SectionHeader } from '../../../components/section-header';
import { isDashboardPath } from '../../../utils/link';
import { getPartnerOffers, getTrustedPartners } from './constants';
import type { PartnerOffer, PartnerOfferLinks, RecordTracksEvent } from './types';

import './style.scss';

const VIEW_TERMS_URL = 'https://automattic.com/for-agencies/program-incentives';

type SectionId = 'refer' | 'resell' | 'partner';
type SectionFilter = SectionId | 'all';

function PartnerOfferCard( {
	item,
	recordTracksEvent,
	onCtaClick,
	shouldUseRouterLink,
	defaultTermsUrl,
}: {
	item: PartnerOffer;
	recordTracksEvent: RecordTracksEvent;
	onCtaClick?: ( offer: PartnerOffer, event: React.MouseEvent ) => void;
	shouldUseRouterLink: boolean;
	defaultTermsUrl?: string;
} ) {
	const termsUrl = item.termsUrl ?? defaultTermsUrl;
	// Offers lead with their number; partner cards lead with a longer benefit line.
	const isPartner = item.offerType === 'partner';

	const handleCTAClick = ( event: React.MouseEvent ) => {
		onCtaClick?.( item, event );
		// A host that stops the click (an offer the agency can't take yet) records its own event.
		if ( ! event.defaultPrevented ) {
			recordTracksEvent( 'calypso_a4a_exclusive_offers_cta_click', { offer_id: item.id } );
			if ( item.tracksEventName ) {
				recordTracksEvent( item.tracksEventName );
			}
		}
	};

	const handleViewTermsClick = () => {
		recordTracksEvent( 'calypso_a4a_exclusive_offers_view_terms_click', { offer_id: item.id } );
	};

	return (
		<Card>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 4 } justify="flex-start" style={ { flex: 1 } }>
					<HStack>
						<HStack
							className="exclusive-offers-card-logo"
							spacing={ 0 }
							justify="flex-start"
							alignment="center"
							expanded={ false }
						>
							{ item.logo }
						</HStack>
						{ item.badge && <Badge intent="draft">{ item.badge }</Badge> }
					</HStack>
					<VStack spacing={ 2 }>
						<Heading level={ 3 } size={ isPartner ? 15 : 20 } weight={ 500 }>
							{ item.title }
						</Heading>
						<Text variant="muted">{ item.description }</Text>
					</VStack>
				</VStack>
				{ item.cta && (
					<ButtonStack
						style={ {
							marginTop: '24px',
							alignSelf: 'flex-start',
							justifyContent: 'flex-start',
							gap: '16px',
						} }
					>
						{ shouldUseRouterLink && isDashboardPath( item.cta.url ) ? (
							<RouterLinkButton
								variant="secondary"
								size="compact"
								to={ item.cta.url.split( '?' )[ 0 ] }
								search={ getQueryArgs( item.cta.url ) }
								onClick={ handleCTAClick }
							>
								{ item.cta.label }
							</RouterLinkButton>
						) : (
							<Button
								variant="secondary"
								size="compact"
								href={ item.cta.url }
								target={ item.cta.external ? '_blank' : undefined }
								rel={ item.cta.external ? 'noopener noreferrer' : undefined }
								onClick={ handleCTAClick }
							>
								{ item.cta.label }
							</Button>
						) }
						{ termsUrl && (
							<Button
								variant="link"
								href={ termsUrl }
								target="_blank"
								onClick={ handleViewTermsClick }
								style={ {
									whiteSpace: 'nowrap',
								} }
							>
								{ __( 'View terms' ) }
							</Button>
						) }
					</ButtonStack>
				) }
			</CardBody>
		</Card>
	);
}

export default function PartnerOffers( {
	links,
	recordTracksEvent = () => {},
	onCtaClick,
	shouldUseRouterLink = true,
}: {
	links: PartnerOfferLinks;
	recordTracksEvent?: RecordTracksEvent;
	onCtaClick?: ( offer: PartnerOffer, event: React.MouseEvent ) => void;
	/**
	 * Set to false in apps without the dashboard's TanStack Router, so the CTAs
	 * render plain anchors for the host app's own router to pick up.
	 */
	shouldUseRouterLink?: boolean;
} ) {
	const [ filter, setFilter ] = useState< SectionFilter >( 'all' );
	// The toggle doesn't fit on narrow screens.
	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const partnerOffers = useMemo( () => getPartnerOffers( links ), [ links ] );
	const trustedPartners = useMemo( () => getTrustedPartners(), [] );

	const sections: {
		id: SectionId;
		label: string;
		title: string;
		description: string;
		items: PartnerOffer[];
	}[] = [
		{
			id: 'refer',
			label: __( 'Refer' ),
			title: __( 'Refer and earn' ),
			description: __( 'Your clients buy and pay directly, and you earn on every sale.' ),
			items: partnerOffers.filter( ( offer ) => offer.offerType !== 'resell' ),
		},
		{
			id: 'resell',
			label: __( 'Resell' ),
			title: __( 'Resell and save' ),
			description: __( 'Buy in bulk at a discount and bill your clients yourself.' ),
			items: partnerOffers.filter( ( offer ) => offer.offerType === 'resell' ),
		},
		{
			id: 'partner',
			label: __( 'Partners' ),
			title: __( 'Trusted partners' ),
			description: __( 'Tools from Automattic partners we recommend for your clients.' ),
			items: trustedPartners,
		},
	];

	const options: { value: SectionFilter; label: string }[] = [
		{ value: 'all', label: __( 'All' ) },
		...sections.map( ( section ) => ( { value: section.id, label: section.label } ) ),
	];
	const handleFilterChange = ( value: unknown ) => {
		setFilter( options.find( ( option ) => option.value === value )?.value ?? 'all' );
	};
	const visibleSections = sections.filter(
		( section ) => filter === 'all' || section.id === filter
	);

	return (
		<VStack spacing={ 8 }>
			<HStack justify="space-between" alignment="center" spacing={ 6 } wrap>
				<Text size={ 15 } style={ { maxWidth: '600px' } }>
					{ __(
						'Discover exclusive offers, events, training, and tools from Automattic and our partners. Everything you need to help your agency grow and support your clients.'
					) }
				</Text>
				{ isSmallViewport ? (
					<SelectControl
						label={ __( 'Offer type' ) }
						hideLabelFromVision
						size="compact"
						value={ filter }
						options={ options.map( ( option ) => ( {
							value: option.value,
							label: option.value === 'all' ? __( 'All offers' ) : option.label,
						} ) ) }
						onChange={ handleFilterChange }
						__nextHasNoMarginBottom
					/>
				) : (
					<ToggleGroupControl
						label={ __( 'Offer type' ) }
						value={ filter }
						hideLabelFromVision
						isBlock={ false }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						onChange={ handleFilterChange }
					>
						{ options.map( ( option ) => (
							<ToggleGroupControlOption
								key={ option.value }
								value={ option.value }
								label={ option.label }
							/>
						) ) }
					</ToggleGroupControl>
				) }
			</HStack>
			<VStack spacing={ 12 }>
				{ visibleSections.map( ( section ) => (
					<VStack key={ section.id } spacing={ 6 }>
						<SectionHeader title={ section.title } description={ section.description } />
						<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap="2xl">
							{ section.items.map( ( item ) => (
								<PartnerOfferCard
									key={ item.id }
									item={ item }
									recordTracksEvent={ recordTracksEvent }
									onCtaClick={ section.id === 'partner' ? undefined : onCtaClick }
									shouldUseRouterLink={ shouldUseRouterLink }
									defaultTermsUrl={ section.id === 'partner' ? undefined : VIEW_TERMS_URL }
								/>
							) ) }
						</Grid>
					</VStack>
				) ) }
			</VStack>
		</VStack>
	);
}
