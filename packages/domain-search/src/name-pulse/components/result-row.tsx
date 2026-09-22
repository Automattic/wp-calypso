import { DomainAvailabilityStatus } from '@automattic/api-core';
import { formatCurrency } from '@automattic/number-formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { cautionFilled, cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useState } from 'react';
import { convertAvailabilityToSuggestion } from '../../helpers/convert-availability-to-suggestion';
import { DomainPriceRule } from '../../hooks/use-suggestion';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal, DomainSuggestionBadge } from '../../ui';
import {
	NamePulseDomainStatus,
	pickPricing,
	type NamePulseDomainResult,
	type NamePulseVerdict,
} from '../helpers';
import { setNamePulseVerdict } from '../hooks/use-name-pulse-verdicts';
import type { DomainAvailability } from '@automattic/api-core';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
}

const isAvailableStatus = ( status: DomainAvailabilityStatus ) =>
	status === DomainAvailabilityStatus.AVAILABLE ||
	status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

const toRealtimeVerdict = ( availability: DomainAvailability ): NamePulseVerdict => {
	const available = isAvailableStatus( availability.status );

	return {
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		...pickPricing( availability ),
		cost: available ? availability.cost : undefined,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		is_realtime: true,
	};
};

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
	// Below desktop the row is too narrow to truncate without losing most of the
	// name, so the name wraps onto a second line instead.
	const wrapName = useViewportMatch( 'medium', '<' );
	const [ trademarkClaimsNoticeInfo, setTrademarkClaimsNoticeInfo ] =
		useState< DomainAvailability[ 'trademark_claims_notice_info' ] >();

	const {
		domain_name: domainName,
		suffix,
		status,
		is_premium: isPremium,
		is_realtime: isRealtime,
	} = result;
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	// Bulk results carry no premium pricing; the badge stands in for the price
	// until the real-time check on click fills it in.
	const showPremiumBadge = isAvailable && isPremium && ! isRealtime;
	const showSaleBadge = isAvailable && hasSalePrice( result );
	// A badge eats into the name column's width, so it gets a tighter label
	// truncation budget than a row with the space to spare.
	const labelTruncateLimit = showSaleBadge || showPremiumBadge ? 12 : 20;
	const inCart = cart.hasItem( domainName );
	const suffixText = (
		<Text as="span" weight={ 600 } variant={ isUnavailable ? 'muted' : undefined }>
			{ suffix ? `.${ suffix }` : '' }
		</Text>
	);

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
			setNamePulseVerdict( queryClient, domainName, toRealtimeVerdict( availability ) );

			if ( ! isAvailableStatus( availability.status ) ) {
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
			<span className="name-pulse-row__name">
				{ wrapName ? (
					<span className="name-pulse-row__domain name-pulse-row__domain--wrap">
						<Text as="span" variant="muted">
							{ label }
						</Text>
						<wbr />
						{ suffixText }
					</span>
				) : (
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
							{ suffixText }
						</span>
					</Tooltip>
				) }
				{ showSaleBadge && (
					<DomainSuggestionBadge variation="warning">{ __( 'Sale' ) }</DomainSuggestionBadge>
				) }
				{ showPremiumBadge && (
					<DomainSuggestionBadge variation="premium">{ __( 'Premium' ) }</DomainSuggestionBadge>
				) }
			</span>
			<span className="name-pulse-row__status">
				{ isWaiting && (
					<span className="name-pulse-row__skeleton" role="img" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isAvailable && ! showPremiumBadge && <Price result={ result } /> }
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
