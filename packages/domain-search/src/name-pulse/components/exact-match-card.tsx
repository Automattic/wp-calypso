import { Button, __experimentalText as Text } from '@wordpress/components';
import { arrowRight, cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { Badge } from '@wordpress/ui';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice, DomainSearchTrademarkClaimsModal } from '../../ui';
import { useNamePulseCartToggle } from '../hooks/use-name-pulse-cart-toggle';
import { hasNamePulseSalePrice, NamePulsePrice } from './price';
import type { NamePulseDomainResult } from '../helpers';

export const NamePulseExactMatchCard = ( { result }: { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const { events } = useDomainSearch();
	const { domain_name: domainName, suffix, is_premium: isPremium } = result;
	const label = domainName.slice( 0, -( suffix.length + 1 ) );
	const {
		inCart,
		isPending,
		error,
		toggleCart,
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim,
		closeTrademarkClaims,
	} = useNamePulseCartToggle( domainName, 0 );

	return (
		<div className="name-pulse-exact-card" data-domain={ domainName }>
			<span className="name-pulse-exact-card__badges">
				<Badge>{ __( 'Exact match' ) }</Badge>
				<Badge intent="stable">{ __( "It's available!" ) }</Badge>
				{ hasNamePulseSalePrice( result ) && <Badge intent="medium">{ __( 'Sale' ) }</Badge> }
				{ isPremium && <Badge intent="informational">{ __( 'Premium' ) }</Badge> }
			</span>
			<Text as="p" size={ 32 } weight={ 500 } className="name-pulse-exact-card__domain">
				{ label }
				<span className="name-pulse-exact-card__tld">.{ suffix }</span>
			</Text>
			{ error && <DomainSearchNotice status="error">{ error.message }</DomainSearchNotice> }
			<div className="name-pulse-exact-card__footer">
				<NamePulsePrice result={ result } size={ 20 } />
				{ inCart ? (
					<Button
						variant="secondary"
						icon={ arrowRight }
						iconPosition="right"
						__next40pxDefaultSize
						onClick={ events.onContinue }
					>
						{ __( 'Continue' ) }
					</Button>
				) : (
					<Button
						variant="primary"
						icon={ cartIcon }
						__next40pxDefaultSize
						isBusy={ isPending }
						disabled={ isPending }
						accessibleWhenDisabled
						onClick={ toggleCart }
					>
						{ __( 'Add to cart' ) }
					</Button>
				) }
			</div>
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

/**
 * Holds the card's place in the featured row. Only the exact-match slot is
 * announced; the bundle beside it may never come.
 */
export const NamePulseFeaturedCardSkeleton = ( { label }: { label?: string } ) => (
	<div
		className="name-pulse-exact-card name-pulse-exact-card--skeleton"
		{ ...( label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true } ) }
	>
		<span className="name-pulse-row__skeleton" />
		<span className="name-pulse-row__skeleton name-pulse-exact-card__skeleton-domain" />
		<span className="name-pulse-row__skeleton" />
	</div>
);
