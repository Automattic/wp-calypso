import { DomainAvailabilityStatus, type DomainAvailability } from '@automattic/api-core';
import { useIsMutating } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { parseMatchReasons } from '../../helpers';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { useDomainSearch } from '../../page/context';
import {
	DomainSearchTrademarkClaimsModal,
	DomainSuggestionContinueCTA,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrice,
	DomainSuggestionPrimaryCTA,
} from '../../ui';
import { DomainSuggestionMatchReasons } from '../../ui/domain-suggestion-match-reasons';
import { bullseyeIcon } from '../../ui/icons/bullseye-icon';
import {
	getNamePulseRenderTracksProps,
	getNamePulseSalePrice,
	NamePulseDomainStatus,
	toNamePulseTracksSuggestion,
} from '../helpers';
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import {
	getNamePulseRenderKey,
	recordNamePulseRender,
	useNamePulseResultSet,
} from '../hooks/use-name-pulse-result-set';
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
	isWide = false,
}: {
	domainName: string;
	tld: string;
	availability: DomainAvailability;
	/** Set when no bundle card shares the row, so the card spans it alone. */
	isWide?: boolean;
} ) => {
	const { __ } = useI18n();
	const { events } = useDomainSearch();
	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();
	const isMutating = !! useIsMutating();
	const result = useMemo(
		() => ( {
			domain_name: domainName,
			source: 'exact' as const,
			status: NamePulseDomainStatus.AVAILABLE,
			is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
			cost: availability.cost,
			raw_price: availability.raw_price,
			currency_code: availability.currency_code,
		} ),
		[ domainName, availability ]
	);
	const resultSet = useNamePulseResultSet();
	const renderKey = getNamePulseRenderKey( 'exact', domainName );
	const getRendered = () => resultSet?.rendered.get( renderKey );
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
	} = useNamePulseCartToggle( result, 0, getRendered, availability.policy_notices );

	useEffect( () => {
		const id = resultSet?.id;

		if ( ! id || resultSet.rendered.has( renderKey ) ) {
			return;
		}

		const report = recordNamePulseRender( { ...resultSet, id }, renderKey, 'exact', 0 );
		events.onSuggestionRender(
			toNamePulseTracksSuggestion( result, 0 ),
			undefined,
			getNamePulseRenderTracksProps( result, report )
		);
	} );

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
			<div
				className={ clsx( 'name-pulse-exact-card', isWide && 'name-pulse-exact-card--wide' ) }
				data-domain={ domainName }
				ref={ containerRef }
			>
				<VStack spacing={ 4 }>
					<HStack justify="flex-start" spacing={ 3 } expanded={ false } wrap>
						<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
							<span className="name-pulse-exact-card__icon">{ bullseyeIcon }</span>
							<Text size={ 14 } weight={ 500 }>
								{ __( 'Exact match' ) }
							</Text>
						</HStack>
						<Badge>{ __( "It's available!" ) }</Badge>
						{ availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM && (
							<Badge intent="informational">{ __( 'Premium' ) }</Badge>
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

/**
 * Holds the card's place while the typed domain is checked, with the same
 * stand-in text and skeleton bars as the bundle card placeholder.
 */
export const NamePulseExactMatchCardPlaceholder = ( {
	domainName,
	tld,
}: {
	domainName: string;
	tld: string;
} ) => {
	const { __ } = useI18n();
	const matchReason = useMemo(
		() => parseMatchReasons( domainName, [ 'tld-exact' ] )[ 0 ],
		[ domainName ]
	);

	return (
		<div
			className="name-pulse-exact-card name-pulse-exact-card--placeholder"
			role="status"
			aria-busy="true"
			aria-label={ __( 'Loading exact match' ) }
		>
			<VStack spacing={ 4 } aria-hidden="true">
				<HStack justify="flex-start" spacing={ 3 } expanded={ false } wrap>
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						<span className="name-pulse-exact-card__skeleton name-pulse-exact-card__skeleton--icon" />
						<Text size={ 14 } weight={ 500 }>
							<span className="name-pulse-exact-card__skeleton">{ __( 'Exact match' ) }</span>
						</Text>
					</HStack>
					<span className="name-pulse-exact-card__skeleton name-pulse-exact-card__skeleton--badge" />
				</HStack>

				<Text as="p" size={ 32 } className="name-pulse-exact-card__domain">
					<span className="name-pulse-exact-card__skeleton">
						{ domainName.slice( 0, -( tld.length + 1 ) ) }
						<span className="name-pulse-exact-card__tld">.{ tld }</span>
					</span>
				</Text>

				<div className="name-pulse-exact-card__price-row">
					<Text size={ 24 }>
						<span className="name-pulse-exact-card__skeleton">$00.00/year</span>
					</Text>
					<span className="name-pulse-exact-card__cta name-pulse-exact-card__skeleton name-pulse-exact-card__skeleton--cta" />
				</div>

				{ matchReason && (
					<div className="name-pulse-exact-card__footer">
						<ul className="domain-suggestion-match-reasons">
							<li>
								<Text className="domain-suggestion-match-reason__text">
									<span className="name-pulse-exact-card__skeleton name-pulse-exact-card__skeleton--icon" />
									<span className="name-pulse-exact-card__skeleton">{ matchReason }</span>
								</Text>
							</li>
						</ul>
					</div>
				) }
			</VStack>
		</div>
	);
};
