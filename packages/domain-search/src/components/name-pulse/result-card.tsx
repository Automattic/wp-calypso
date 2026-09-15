import { DomainAvailabilityStatus } from '@automattic/api-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../../helpers/name-pulse';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal, DomainSuggestionBadge } from '../../ui';
import type { DomainAvailability } from '@automattic/api-core';

export interface NamePulseResultCardProps {
	result: NamePulseDomainResult;
	position: number;
	/**
	 * Receives the v1.3 real-time verdict so the row (and any duplicate of it
	 * in another section) reflects what the registry actually said.
	 */
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

const isAvailableStatus = ( status: DomainAvailabilityStatus ) =>
	status === DomainAvailabilityStatus.AVAILABLE ||
	status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

export const toRealtimeUpdate = (
	domainName: string,
	availability: DomainAvailability
): NamePulseDomainUpdate => {
	const available = isAvailableStatus( availability.status );

	return {
		domain_name: domainName,
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		cost: available ? availability.cost : undefined,
		raw_price: availability.raw_price,
		sale_cost: availability.sale_cost,
		currency_code: availability.currency_code,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		product_id: availability.product_id,
		product_slug: availability.product_slug,
		supports_privacy: availability.supports_privacy,
		vendor: availability.root_domain_provider,
		is_realtime: true,
	};
};

export const NamePulseResultCard = ( { result, position, onUpdate }: NamePulseResultCardProps ) => {
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimModalOpen, setTrademarkClaimModalOpen ] = useState( false );

	const {
		domain_name: domainName,
		suffix,
		status,
		cost,
		is_premium: isPremium,
		is_realtime,
	} = result;
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	const showPremiumBadge = isPremium && ! is_realtime;
	const inCart = cart.hasItem( domainName );

	const {
		mutate: toggleCart,
		isPending,
		error,
	} = useMutation( {
		mutationFn: async ( { acceptedTrademarkClaim }: { acceptedTrademarkClaim: boolean } ) => {
			if ( inCart ) {
				const item = cart.items.find( ( i ) => `${ i.domain }.${ i.tld }` === domainName );
				if ( item ) {
					await cart.onRemoveItem( item.uuid );
				}
				return { addedToCart: false };
			}

			// Bulk results are zone-file based (~25% mismatch); the real EPP check
			// runs on click, exactly like the classic suggestion CTA.
			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);
			const suggestion = convertAvailabilityToSuggestion( availability );

			events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );
			onUpdate?.( toRealtimeUpdate( domainName, availability ) );

			if ( ! isAvailableStatus( availability.status ) ) {
				throw new Error( __( 'Sorry, this domain is no longer available.' ) );
			}

			if ( availability.trademark_claims_notice_info && ! acceptedTrademarkClaim ) {
				events.onTrademarkClaimsNoticeShown( {
					...suggestion,
					position,
					price_rule: DomainPriceRule.PRICE,
				} );
				setTrademarkClaimModalOpen( true );
				return { addedToCart: false };
			}

			await cart.onAddItem( suggestion );
			return { addedToCart: true, suggestion };
		},
		onSuccess: ( data ) => {
			if ( data.addedToCart && data.suggestion ) {
				events.onAddDomainToCart(
					domainName,
					position,
					data.suggestion.is_premium ?? false,
					data.suggestion.vendor
				);
			}
		},
		networkMode: 'always',
		retry: false,
	} );

	const trademarkClaimsNoticeInfo = queryClient.getQueryData< DomainAvailability >(
		queries.domainAvailability( domainName ).queryKey
	)?.trademark_claims_notice_info;

	return (
		<div
			className="name-pulse-card"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span className="name-pulse-card__name">
				<Text as="span" weight={ 500 } variant={ isUnavailable ? 'muted' : undefined }>
					{ label }
				</Text>
				<Text as="span" variant="muted">
					{ suffix ? `.${ suffix }` : '' }
				</Text>
			</span>
			<span className="name-pulse-card__status">
				{ isWaiting && (
					<span className="name-pulse-card__skeleton" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isAvailable && (
					<>
						{ showPremiumBadge ? (
							<DomainSuggestionBadge variation="warning">{ __( 'Premium' ) }</DomainSuggestionBadge>
						) : (
							cost && <Text weight={ 500 }>{ cost }</Text>
						) }
						<Button
							variant={ inCart ? 'primary' : 'secondary' }
							size="compact"
							isBusy={ isPending }
							disabled={ isPending }
							aria-pressed={ inCart }
							onClick={ () => toggleCart( { acceptedTrademarkClaim: false } ) }
						>
							{ inCart ? __( 'Remove' ) : __( 'Add' ) }
						</Button>
					</>
				) }
			</span>
			{ error && (
				<Text className="name-pulse-card__error" variant="muted" size={ 12 }>
					{ error.message }
				</Text>
			) }
			{ trademarkClaimsNoticeInfo && trademarkClaimModalOpen && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
					onAccept={ () => {
						setTrademarkClaimModalOpen( false );
						toggleCart( { acceptedTrademarkClaim: true } );
					} }
					onClose={ () => setTrademarkClaimModalOpen( false ) }
				/>
			) }
		</div>
	);
};

export const NamePulseResultCardSkeleton = () => (
	<div className="name-pulse-card name-pulse-card--skeleton" aria-hidden="true">
		<span className="name-pulse-card__skeleton name-pulse-card__skeleton--name" />
		<span className="name-pulse-card__skeleton" />
	</div>
);
