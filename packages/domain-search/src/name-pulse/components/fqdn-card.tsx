import { useI18n } from '@wordpress/react-i18n';
import {
	DomainSuggestion,
	DomainSuggestionBadge,
	DomainSuggestionErrorCTA,
	DomainSuggestionPrice,
	DomainSuggestionPrimaryCTA,
} from '../../ui';
import { bullseyeIcon } from '../../ui/icons/bullseye-icon';
import {
	getDisplayPrices,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';

interface NamePulseFqdnCardProps {
	/** Missing until the TLD list arrives and the exact-match rows exist. */
	result?: NamePulseDomainResult;
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

const FqdnCard = ( {
	result,
	onUpdate,
}: NamePulseFqdnCardProps & { result: NamePulseDomainResult } ) => {
	const { __ } = useI18n();
	const { domain_name: domainName, suffix, status, is_premium: isPremium } = result;
	const { inCart, toggleCart, isPending, error, trademarkClaimsModal } = useNamePulseAddToCart(
		domainName,
		0,
		onUpdate
	);
	const label = domainName.slice( 0, -( suffix.length + 1 ) );
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const { yearlyPrice, salePrice } = getDisplayPrices( result );

	const badges = [
		<DomainSuggestionBadge key="exact-match">
			{ bullseyeIcon }
			{ __( 'Exact match' ) }
		</DomainSuggestionBadge>,
		isAvailable ? (
			<DomainSuggestionBadge key="status" variation="success">
				{ __( "It's available!" ) }
			</DomainSuggestionBadge>
		) : (
			<DomainSuggestionBadge key="status">
				{ status === NamePulseDomainStatus.TAKEN ? __( 'Unavailable' ) : __( 'Couldn’t check' ) }
			</DomainSuggestionBadge>
		),
		isAvailable && isPremium && (
			<DomainSuggestionBadge key="premium" variation="warning">
				{ __( 'Premium' ) }
			</DomainSuggestionBadge>
		),
	];

	const price = isAvailable && yearlyPrice && (
		<DomainSuggestionPrice
			price={ yearlyPrice }
			salePrice={ salePrice }
			renewPrice={ yearlyPrice }
		/>
	);

	const cta = error ? (
		<DomainSuggestionErrorCTA errorMessage={ error.message } callback={ toggleCart } />
	) : (
		<DomainSuggestionPrimaryCTA
			onClick={ toggleCart }
			isBusy={ isPending }
			disabled={ isPending }
			label={ inCart ? __( 'Remove from cart' ) : undefined }
		>
			{ inCart ? __( 'Remove' ) : undefined }
		</DomainSuggestionPrimaryCTA>
	);

	return (
		<div className="name-pulse-fqdn-card" role="list" data-domain={ domainName }>
			<DomainSuggestion.Featured
				isSingleFeaturedSuggestion
				isHighlighted={ isAvailable }
				domain={ label }
				tld={ suffix }
				badges={ badges }
				price={ price }
				cta={ isAvailable && cta }
			/>
			{ trademarkClaimsModal }
		</div>
	);
};

export const NamePulseFqdnCard = ( { result, onUpdate }: NamePulseFqdnCardProps ) => {
	if ( ! result || result.status === NamePulseDomainStatus.WAITING ) {
		return (
			<div className="name-pulse-fqdn-card">
				<DomainSuggestion.Featured.Placeholder />
			</div>
		);
	}

	return <FqdnCard result={ result } onUpdate={ onUpdate } />;
};
