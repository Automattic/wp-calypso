import { Button, __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { DomainSuggestionBadge } from '../../ui';
import {
	getDisplayPrices,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
	/** Receives the real-time verdict so every copy of the row reflects it. */
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

const Price = ( { yearlyPrice, salePrice }: { yearlyPrice: string; salePrice?: string } ) => {
	const { __ } = useI18n();
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

export const NamePulseResultRow = ( { result, position, onUpdate }: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const {
		domain_name: domainName,
		suffix,
		status,
		is_premium: isPremium,
		is_realtime: isRealtime,
	} = result;
	const { inCart, toggleCart, isPending, error, trademarkClaimsModal } = useNamePulseAddToCart(
		domainName,
		position,
		onUpdate
	);
	const { yearlyPrice, salePrice } = getDisplayPrices( result );
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	// Bulk results carry no premium pricing; the badge stands in for the price
	// until the real-time check on click fills it in.
	const showPremiumBadge = isAvailable && isPremium && ! isRealtime;
	const showSaleBadge = isAvailable && !! salePrice;

	return (
		<div
			className="name-pulse-row"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<span className="name-pulse-row__name">
				<span className="name-pulse-row__domain">
					<Text as="span" variant="muted" truncate>
						{ label }
					</Text>
					<Text as="span" weight={ 600 } variant={ isUnavailable ? 'muted' : undefined }>
						{ suffix ? `.${ suffix }` : '' }
					</Text>
				</span>
				{ showSaleBadge && (
					<DomainSuggestionBadge variation="warning">{ __( 'Sale' ) }</DomainSuggestionBadge>
				) }
				{ showPremiumBadge && (
					<DomainSuggestionBadge variation="warning">{ __( 'Premium' ) }</DomainSuggestionBadge>
				) }
			</span>
			<span className="name-pulse-row__status">
				{ isWaiting && (
					<span className="name-pulse-row__skeleton" role="img" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isAvailable && (
					<>
						{ ! showPremiumBadge && yearlyPrice && (
							<Price yearlyPrice={ yearlyPrice } salePrice={ salePrice } />
						) }
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
					</>
				) }
			</span>
			{ error && (
				<Text className="name-pulse-row__error" variant="muted" size={ 12 }>
					{ error.message }
				</Text>
			) }
			{ trademarkClaimsModal }
		</div>
	);
};

export const NamePulseResultRowSkeleton = () => (
	<div className="name-pulse-row name-pulse-row--skeleton" aria-hidden="true">
		<span className="name-pulse-row__skeleton name-pulse-row__skeleton--name" />
		<span className="name-pulse-row__skeleton" />
	</div>
);
