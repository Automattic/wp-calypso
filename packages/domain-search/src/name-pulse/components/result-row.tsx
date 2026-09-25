import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip, __experimentalText as Text } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { cautionFilled, cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Badge } from '@wordpress/ui';
import clsx from 'clsx';
import { useEffect, useMemo } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchTrademarkClaimsModal } from '../../ui';
import {
	NamePulseDomainStatus,
	toNamePulseRealtimeVerdict,
	type NamePulseDomainResult,
} from '../helpers';
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import { setNamePulseVerdict } from '../hooks/use-name-pulse-verdicts';
import { hasNamePulseSalePrice, NamePulsePrice } from './price';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
}

export const NamePulseResultRow = ( { result, position }: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const { queries } = useDomainSearch();
	const queryClient = useQueryClient();
	// Below wide desktop the row is too narrow to truncate without losing most of
	// the name, so the name wraps onto a second line instead.
	const wrapName = useViewportMatch( 'large', '<' );
	const {
		inCart,
		isPending,
		error,
		toggleCart,
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim,
		closeTrademarkClaims,
	} = useNamePulseCartToggle( result.domain_name, position );

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
	const showSaleBadge = isAvailable && hasNamePulseSalePrice( row );
	// One badge still fits beside the name; two leave it only a few characters,
	// so the pair moves under it and the name keeps the full column width.
	const stackBadges = showSaleBadge && showPremiumBadge;
	const labelTruncateLimit = ( showSaleBadge || showPremiumBadge ) && ! stackBadges ? 12 : 20;
	const suffixText = (
		<Text as="span" weight={ 600 } variant={ isUnavailable ? 'muted' : undefined }>
			{ suffix ? `.${ suffix }` : '' }
		</Text>
	);

	return (
		<div
			className="name-pulse-row"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span
				className={ clsx( 'name-pulse-row__name', stackBadges && 'name-pulse-row__name--stacked' ) }
			>
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
				{ ( showSaleBadge || showPremiumBadge ) && (
					<span className="name-pulse-row__badges">
						{ showSaleBadge && <Badge intent="medium">{ __( 'Sale' ) }</Badge> }
						{ showPremiumBadge && <Badge intent="informational">{ __( 'Premium' ) }</Badge> }
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
				{ isAvailable && ! isPremiumPriceMissing && <NamePulsePrice result={ row } /> }
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

export const NamePulseResultRowSkeleton = () => (
	<div className="name-pulse-row name-pulse-row--skeleton" aria-hidden="true">
		<span className="name-pulse-row__skeleton name-pulse-row__skeleton--name" />
		<span className="name-pulse-row__skeleton" />
	</div>
);
