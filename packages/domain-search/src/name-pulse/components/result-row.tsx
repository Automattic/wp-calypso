import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip, __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { cautionFilled, cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal, DomainSuggestionBadge } from '../../ui';
import {
	isNamePulseAvailable,
	NamePulseDomainStatus,
	toNamePulseRealtimeVerdict,
	type NamePulseDomainResult,
} from '../helpers';
import { setNamePulseVerdict } from '../hooks/use-name-pulse-verdicts';
import type { DomainAvailability } from '@automattic/api-core';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
}

const formatPrice = ( amount: number, currencyCode: string ) =>
	formatCurrency( amount, currencyCode, { stripZeros: true } );

/**
 * Only `sale_cost` is a bare number, so a sale needs a known currency to render.
 */
const hasSalePrice = ( {
	sale_cost: saleCost,
	currency_code: currencyCode,
}: NamePulseDomainResult ) => typeof saleCost === 'number' && !! currencyCode;

const Price = ( { result }: { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const { cost, raw_price: rawPrice, sale_cost: saleCost, currency_code: currencyCode } = result;
	const yearlyPrice =
		typeof rawPrice === 'number' && currencyCode ? formatPrice( rawPrice, currencyCode ) : cost;

	if ( ! yearlyPrice ) {
		return null;
	}

	const salePrice =
		typeof saleCost === 'number' && currencyCode
			? formatPrice( saleCost, currencyCode )
			: undefined;
	const isSale = !! salePrice;

	return (
		<span className={ clsx( 'name-pulse-row__price', isSale && 'name-pulse-row__price--sale' ) }>
			<span className="name-pulse-row__price-line">
				<Text
					weight={ 600 }
					color={ isSale ? 'var( --domain-search-promotional-price-color )' : undefined }
				>
					{ salePrice ?? yearlyPrice }
				</Text>
				<Text size={ 12 } variant="muted">
					{ isSale ? __( '/first year' ) : __( '/year' ) }
				</Text>
			</span>
			{ isSale && (
				<Text size={ 12 } variant="muted">
					{ sprintf(
						// translators: %(price)s is the domain renewal price.
						__( '%(price)s/year renewal' ),
						{ price: yearlyPrice }
					) }
				</Text>
			) }
		</span>
	);
};

export const NamePulseResultRow = ( { result, position }: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const { cart, events, queries } = useDomainSearch();
	const queryClient = useQueryClient();
	const [ trademarkClaimsNoticeInfo, setTrademarkClaimsNoticeInfo ] =
		useState< DomainAvailability[ 'trademark_claims_notice_info' ] >();

	const { domain_name: domainName, suffix, source } = result;
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	// The bulk check prices a premium name at its TLD's standard rate, so the row
	// asks for a per-domain check rather than quoting a price we cannot honor.
	// Suggestions are priced by the registry already, so they render straight away.
	const needsPremiumPrice =
		result.status === NamePulseDomainStatus.AVAILABLE &&
		!! result.is_premium &&
		! result.is_realtime &&
		source === 'exact';

	// The key is shared with the pre-cart check, so clicking the row afterwards
	// costs no second request.
	const { data: realtimeAvailability, isError: isPremiumPriceError } = useQuery( {
		...queries.domainAvailability( domainName ),
		enabled: needsPremiumPrice,
	} );

	// A disabled query still reports whatever the shared key already holds, and the
	// typed-domain notice warms it for a name nobody clicked. Only the row that
	// asked for the check may turn it into a real-time verdict.
	const realtimeVerdict = useMemo(
		() =>
			needsPremiumPrice && realtimeAvailability
				? toNamePulseRealtimeVerdict( realtimeAvailability )
				: undefined,
		[ needsPremiumPrice, realtimeAvailability ]
	);

	// Every other row listing this name reads the verdict from the shared cache.
	useEffect( () => {
		if ( realtimeVerdict ) {
			setNamePulseVerdict( queryClient, domainName, realtimeVerdict );
		}
	}, [ realtimeVerdict, domainName, queryClient ] );

	const row = realtimeVerdict ? { ...result, ...realtimeVerdict } : result;
	const { status, is_premium: isPremium } = row;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	// A failed check leaves the row on its badge alone: no price, and no skeleton
	// waiting for one that is not coming.
	const isPremiumPriceMissing = needsPremiumPrice && ! realtimeVerdict;
	const showPremiumBadge = isAvailable && isPremium;
	const showSaleBadge = isAvailable && hasSalePrice( row );
	// One badge still fits beside the name; two leave it only a few characters,
	// so the pair moves under it and the name keeps the full column width.
	const stackBadges = showSaleBadge && showPremiumBadge;
	const labelTruncateLimit = ( showSaleBadge || showPremiumBadge ) && ! stackBadges ? 12 : 20;
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

			// Bulk results are zone-file based and approximate; the real-time check runs
			// before anything reaches the cart, and every row listing the name reads it.
			const availability = await queryClient.ensureQueryData(
				queries.domainAvailability( domainName )
			);
			const suggestion = convertAvailabilityToSuggestion( availability );

			events.onDomainAddAvailabilityPreCheck( availability, domainName, suggestion.vendor );
			setNamePulseVerdict( queryClient, domainName, toNamePulseRealtimeVerdict( availability ) );

			if ( ! isNamePulseAvailable( availability ) ) {
				throw new Error( __( 'Sorry, this domain is no longer available.' ) );
			}

			if ( availability.trademark_claims_notice_info && ! acceptedTrademarkClaim ) {
				events.onTrademarkClaimsNoticeShown( {
					...suggestion,
					position,
					price_rule: DomainPriceRule.PRICE,
				} );
				setTrademarkClaimsNoticeInfo( availability.trademark_claims_notice_info );
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

	return (
		<div
			className="name-pulse-row"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span
				className={ clsx( 'name-pulse-row__name', stackBadges && 'name-pulse-row__name--stacked' ) }
			>
				<Tooltip text={ domainName }>
					<span className="name-pulse-row__domain">
						<Text
							as="span"
							variant="muted"
							truncate
							ellipsizeMode="middle"
							limit={ labelTruncateLimit }
						>
							{ label }
						</Text>
						<Text as="span" weight={ 600 } variant={ isUnavailable ? 'muted' : undefined }>
							{ suffix ? `.${ suffix }` : '' }
						</Text>
					</span>
				</Tooltip>
				{ ( showSaleBadge || showPremiumBadge ) && (
					<span className="name-pulse-row__badges">
						{ showSaleBadge && (
							<DomainSuggestionBadge variation="warning">{ __( 'Sale' ) }</DomainSuggestionBadge>
						) }
						{ showPremiumBadge && (
							<DomainSuggestionBadge variation="premium">{ __( 'Premium' ) }</DomainSuggestionBadge>
						) }
					</span>
				) }
			</span>
			<span className="name-pulse-row__status">
				{ isWaiting && (
					<span className="name-pulse-row__skeleton" role="img" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isPremiumPriceMissing && ! isPremiumPriceError && (
					<span
						className="name-pulse-row__skeleton"
						role="img"
						aria-label={ __( 'Checking price…' ) }
					/>
				) }
				{ isAvailable && ! isPremiumPriceMissing && <Price result={ row } /> }
				{ error && (
					<Tooltip delay={ 0 } text={ error.message } placement="top">
						<Button
							className="name-pulse-row__cart name-pulse-row__cart--error"
							icon={ cautionFilled }
							label={ error.message }
							showTooltip={ false }
							isDestructive
							variant="primary"
							size="compact"
							disabled
							accessibleWhenDisabled
						/>
					</Tooltip>
				) }
				{ isAvailable && ! error && (
					<Button
						className="name-pulse-row__cart"
						icon={ cartIcon }
						label={ inCart ? __( 'Remove from cart' ) : __( 'Add to cart' ) }
						variant={ inCart ? 'primary' : undefined }
						size="compact"
						isBusy={ isPending }
						disabled={ isPending }
						aria-pressed={ inCart }
						onClick={ () => toggleCart( { acceptedTrademarkClaim: false } ) }
					/>
				) }
			</span>
			{ trademarkClaimsNoticeInfo && (
				<DomainSearchTrademarkClaimsModal
					domainName={ domainName }
					trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
					onAccept={ () => {
						setTrademarkClaimsNoticeInfo( undefined );
						toggleCart( { acceptedTrademarkClaim: true } );
					} }
					onClose={ () => setTrademarkClaimsNoticeInfo( undefined ) }
				/>
			) }
		</div>
	);
};

export const NamePulseResultRowSkeleton = () => (
	<div className="name-pulse-row name-pulse-row--skeleton" aria-hidden="true">
		<span className="name-pulse-row__skeleton name-pulse-row__skeleton--name" />
		<span className="name-pulse-row__skeleton" />
	</div>
);
