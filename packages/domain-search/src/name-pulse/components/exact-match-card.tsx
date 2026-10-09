import { DomainAvailabilityStatus, type DomainAvailability } from '@automattic/api-core';
import { useIsMutating } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useEvent } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useMemo } from 'react';
import { parseMatchReasons } from '../../helpers';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { useDomainSearch } from '../../page/context';
import {
	DomainSearchTrademarkClaimsModal,
	DomainSuggestionBadge,
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrice,
	DomainSuggestionPrimaryCTA,
} from '../../ui';
import { DomainSuggestionMatchReasons } from '../../ui/domain-suggestion-match-reasons';
import { bullseyeIcon } from '../../ui/icons/bullseye-icon';
import {
	getNamePulseSalePrice,
	NamePulseDomainStatus,
	toNamePulseTracksSuggestion,
	type NamePulseDomainResult,
} from '../helpers';
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import { NamePulsePolicyNoticeDialog } from './policy-notice-dialog';

/**
 * Laid out like the bundle card it sits beside, from the classic suggestion
 * pieces. The real-time check behind the notice supplies the sale price, the
 * renewal price and the match reasons.
 */
export const NamePulseExactMatchCard = ( {
	domainName,
	tld,
	availability,
}: {
	domainName: string;
	tld: string;
	availability: DomainAvailability;
} ) => {
	const { __ } = useI18n();
	const { events } = useDomainSearch();
	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();
	const isMutating = !! useIsMutating();
	const result: NamePulseDomainResult = useMemo(
		() => ( {
			domain_name: domainName,
			suffix: tld,
			source: 'exact',
			status: NamePulseDomainStatus.AVAILABLE,
			is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
			cost: availability.cost,
			raw_price: availability.raw_price,
			currency_code: availability.currency_code,
		} ),
		[ domainName, tld, availability ]
	);
	const {
		inCart,
		isPending,
		error,
		toggleCart,
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim,
		closeTrademarkClaims,
		policyNotice,
		isPolicyNoticeOpen,
		confirmPolicyNotice,
		closePolicyNotice,
	} = useNamePulseCartToggle( result, 'exact_card', 0, availability.policy_notices );

	const reportRender = useEvent( () => {
		events.onSuggestionRender( toNamePulseTracksSuggestion( result, 0 ) );
	} );

	useEffect( () => {
		reportRender();
	}, [ reportRender ] );

	const containerContext = useMemo(
		() =>
			( {
				activeQuery,
				currentWidth,
				priceAlignment: 'left',
				priceSize: 24,
				isFeatured: true,
			} ) as const,
		[ activeQuery, currentWidth ]
	);

	// The header already says "Exact match", so that reason is skipped, and the
	// design has room for one line: the most specific of the rest.
	const matchReasons = useMemo(
		() =>
			parseMatchReasons(
				domainName,
				( availability.match_reasons ?? [] ).filter( ( reason ) => reason !== 'exact-match' )
			).slice( 0, 1 ),
		[ domainName, availability.match_reasons ]
	);

	let cta;

	if ( inCart ) {
		cta = <DomainSuggestionContinueCTA disabled={ isMutating } onClick={ events.onContinue } />;
	} else if ( error ) {
		cta = (
			<DomainSuggestionErrorCTA errorMessage={ error.message } callback={ () => toggleCart() } />
		);
	} else {
		cta = (
			<DomainSuggestionPrimaryCTA
				disabled={ isMutating }
				isBusy={ isPending }
				onClick={ () => toggleCart() }
			/>
		);
	}

	return (
		<DomainSuggestionContainerContext.Provider value={ containerContext }>
			<div className="name-pulse-exact-card" data-domain={ domainName } ref={ containerRef }>
				<VStack spacing={ 4 }>
					<HStack justify="flex-start" spacing={ 3 } expanded={ false } wrap>
						<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
							<span className="name-pulse-exact-card__icon">{ bullseyeIcon }</span>
							<Text size={ 14 } weight={ 500 }>
								{ __( 'Exact match' ) }
							</Text>
						</HStack>
						<DomainSuggestionBadge>{ __( "It's available!" ) }</DomainSuggestionBadge>
						{ availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM && (
							<DomainSuggestionBadge variation="premium">{ __( 'Premium' ) }</DomainSuggestionBadge>
						) }
					</HStack>

					<Text as="p" size={ 32 } className="name-pulse-exact-card__domain">
						{ domainName.slice( 0, -( tld.length + 1 ) ) }
						<span className="name-pulse-exact-card__tld">.{ tld }</span>
					</Text>

					<div className="name-pulse-exact-card__price-row">
						<DomainSuggestionPrice
							price={ availability.cost }
							salePrice={ getNamePulseSalePrice( availability ) }
							renewPrice={ availability.renew_cost }
						/>
						<div className="name-pulse-exact-card__cta">{ cta }</div>
					</div>

					{ matchReasons.length > 0 && (
						<div className="name-pulse-exact-card__footer">
							<DomainSuggestionMatchReasons reasons={ matchReasons } />
						</div>
					) }
				</VStack>
			</div>
			{ policyNotice && (
				<NamePulsePolicyNoticeDialog
					notice={ policyNotice }
					open={ isPolicyNoticeOpen }
					isPending={ isPending }
					onConfirm={ confirmPolicyNotice }
					onClose={ closePolicyNotice }
				/>
			) }
			{ trademarkClaimsNoticeInfo && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
					onAccept={ acceptTrademarkClaim }
					onClose={ closeTrademarkClaims }
				/>
			) }
		</DomainSuggestionContainerContext.Provider>
	);
};
