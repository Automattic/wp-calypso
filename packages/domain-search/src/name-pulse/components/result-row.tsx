import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { sprintf } from '@wordpress/i18n';
import { cautionFilled, cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal } from '../../ui';
import {
	formatNamePulsePrice,
	getNamePulseSalePrice,
	NamePulseDomainStatus,
	toNamePulseRealtimeVerdict,
	type NamePulseDomainResult,
} from '../helpers';
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import { useNamePulseLabelLimit } from '../hooks/use-name-pulse-label-limit';
import { setNamePulseVerdict } from '../hooks/use-name-pulse-verdicts';
import { NamePulsePolicyNoticeDialog } from './policy-notice-dialog';

export type NamePulseResultRowVariant = 'row' | 'card';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
	variant?: NamePulseResultRowVariant;
}

const Price = ( {
	result,
	variant,
}: {
	result: NamePulseDomainResult;
	variant: NamePulseResultRowVariant;
} ) => {
	const { __ } = useI18n();
	const { cost, raw_price: rawPrice, currency_code: currencyCode } = result;
	const yearlyPrice =
		typeof rawPrice === 'number' && currencyCode
			? formatNamePulsePrice( rawPrice, currencyCode )
			: cost;

	if ( ! yearlyPrice ) {
		return null;
	}

	const salePrice = getNamePulseSalePrice( result );
	const isSale = !! salePrice;
	const renewal =
		isSale &&
		sprintf(
			// translators: %(price)s is the domain renewal price.
			__( '%(price)s/year renewal' ),
			{ price: yearlyPrice }
		);

	// A card has room for the whole offer on one line: the regular price struck
	// through, the sale price, and the renewal price after it.
	if ( variant === 'card' ) {
		return (
			<span className="name-pulse-row__price name-pulse-row__price--card">
				{ isSale && (
					<Text as="s" size={ 16 } variant="muted">
						{ yearlyPrice }
					</Text>
				) }
				<Text
					size={ 16 }
					color={ isSale ? 'var( --domain-search-promotional-price-color )' : undefined }
				>
					{ salePrice ?? yearlyPrice }
				</Text>
				<Text size={ 13 }>{ isSale ? __( '/first year' ) : __( '/year' ) }</Text>
				{ renewal && (
					<Text size={ 12 } variant="muted">
						{ renewal }
					</Text>
				) }
			</span>
		);
	}

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
			{ renewal && (
				<Text size={ 12 } variant="muted">
					{ renewal }
				</Text>
			) }
		</span>
	);
};

export const NamePulseResultRow = ( {
	result,
	position,
	variant = 'row',
}: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const { queries } = useDomainSearch();
	const queryClient = useQueryClient();
	// Below wide desktop the row is too narrow to truncate without losing most of
	// the name, so the name wraps onto a second line instead.
	const wrapName = useViewportMatch( 'large', '<' );

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

	// The key is shared with the pre-cart check and the typed-domain notice, so
	// clicking the row afterwards costs no second request, and even while disabled
	// the query reports whatever verdict those two already fetched for the name.
	const { data: realtimeAvailability, isError: isPremiumPriceError } = useQuery( {
		...queries.domainAvailability( domainName ),
		enabled: needsPremiumPrice,
	} );

	const realtimeVerdict = useMemo(
		() => ( realtimeAvailability ? toNamePulseRealtimeVerdict( realtimeAvailability ) : undefined ),
		[ realtimeAvailability ]
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
	// TLDs with special requirements are rarely registered, so the requirements
	// stay off the row and are confirmed in a dialog before the name goes to the cart.
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
	} = useNamePulseCartToggle( domainName, position, row.policy_notices );
	const { nameRef, labelRef, limit: labelLimit } = useNamePulseLabelLimit( label );
	const isCard = variant === 'card';
	const nameSize = isCard ? 20 : undefined;
	const suffixText = (
		<Text
			as="span"
			size={ nameSize }
			weight={ isCard ? 400 : 600 }
			variant={ isUnavailable ? 'muted' : undefined }
		>
			{ suffix ? `.${ suffix }` : '' }
		</Text>
	);

	return (
		<div
			className={ clsx( 'name-pulse-row', isCard && 'name-pulse-row--card' ) }
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span ref={ nameRef } className="name-pulse-row__name">
				{ wrapName ? (
					<span className="name-pulse-row__domain name-pulse-row__domain--wrap">
						<Text as="span" size={ nameSize } variant="muted">
							{ label }
						</Text>
						<wbr />
						{ suffixText }
					</span>
				) : (
					<Tooltip text={ domainName }>
						<span className="name-pulse-row__domain">
							<Text
								ref={ labelRef }
								as="span"
								size={ nameSize }
								variant="muted"
								truncate
								ellipsizeMode="middle"
								limit={ labelLimit }
							>
								{ label }
							</Text>
							{ suffixText }
						</span>
					</Tooltip>
				) }
				{ showPremiumBadge && (
					<span className="name-pulse-row__badges">
						<Badge intent="informational">{ __( 'Premium' ) }</Badge>
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
				{ isAvailable && ! isPremiumPriceMissing && <Price result={ row } variant={ variant } /> }
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
						onClick={ toggleCart }
					/>
				) }
			</span>
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
		</div>
	);
};

export const NamePulseResultRowSkeleton = ( {
	variant = 'row',
}: {
	variant?: NamePulseResultRowVariant;
} ) => (
	<div
		className={ clsx(
			'name-pulse-row',
			'name-pulse-row--skeleton',
			variant === 'card' && 'name-pulse-row--card'
		) }
		aria-hidden="true"
	>
		<span className="name-pulse-row__skeleton name-pulse-row__skeleton--name" />
		<span className="name-pulse-row__skeleton" />
	</div>
);
