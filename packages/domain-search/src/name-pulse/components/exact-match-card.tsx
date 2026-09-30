import { formatCurrency } from '@automattic/number-formatters';
import { useIsMutating, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
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
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import type { NamePulseDomainResult } from '../helpers';

/**
 * Laid out like the bundle card it sits beside, from the classic suggestion
 * pieces. The real-time check behind the notice supplies the sale price, the
 * renewal price and the match reasons.
 */
export const NamePulseExactMatchCard = ( { result }: { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const { events, queries } = useDomainSearch();
	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();
	const { domain_name: domainName, suffix, is_premium: isPremium } = result;
	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );
	const isMutating = !! useIsMutating();
	const {
		inCart,
		isPending,
		error,
		toggleCart,
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim,
		closeTrademarkClaims,
	} = useNamePulseCartToggle( domainName, 0 );

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
				( availability?.match_reasons ?? [] ).filter( ( reason ) => reason !== 'exact-match' )
			).slice( 0, 1 ),
		[ domainName, availability?.match_reasons ]
	);

	const saleCost =
		typeof availability?.sale_cost === 'number' && availability.currency_code
			? formatCurrency( availability.sale_cost, availability.currency_code, { stripZeros: true } )
			: undefined;

	let cta;

	if ( inCart ) {
		cta = <DomainSuggestionContinueCTA disabled={ isMutating } onClick={ events.onContinue } />;
	} else if ( error ) {
		cta = <DomainSuggestionErrorCTA errorMessage={ error.message } callback={ toggleCart } />;
	} else {
		cta = (
			<DomainSuggestionPrimaryCTA
				disabled={ isMutating }
				isBusy={ isPending }
				onClick={ toggleCart }
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
						{ isPremium && (
							<DomainSuggestionBadge variation="premium">{ __( 'Premium' ) }</DomainSuggestionBadge>
						) }
					</HStack>

					<Text as="p" size={ 32 } className="name-pulse-exact-card__domain">
						{ domainName.slice( 0, -( suffix.length + 1 ) ) }
						<span className="name-pulse-exact-card__tld">.{ suffix }</span>
					</Text>

					<div className="name-pulse-exact-card__price-row">
						<DomainSuggestionPrice
							price={ availability?.cost ?? result.cost ?? '' }
							salePrice={ saleCost }
							renewPrice={ availability?.renew_cost }
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
