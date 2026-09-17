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

const FqdnCard = ( { result, onUpdate }: Required< NamePulseFqdnCardProps > ) => {
	const { __ } = useI18n();
	const { inCart, toggleCart, isPending, error, trademarkClaimsModal } = useNamePulseAddToCart(
		result,
		0,
		onUpdate
	);
	const { domain_name: domainName, suffix, status, is_premium: isPremium } = result;
	const label = domainName.slice( 0, -( suffix.length + 1 ) );
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const { yearlyPrice, salePrice } = getDisplayPrices( result );

	const badges = [
		<DomainSuggestionBadge key="exact-match">
			{ bullseyeIcon }
			{ __( 'Exact match' ) }
		</DomainSuggestionBadge>,
	];

	if ( isAvailable ) {
		badges.push(
			<DomainSuggestionBadge key="available" variation="success">
				{ __( "It's available!" ) }
			</DomainSuggestionBadge>
		);
	} else {
		badges.push(
			<DomainSuggestionBadge key="unavailable">
				{ status === NamePulseDomainStatus.TAKEN ? __( 'Unavailable' ) : __( 'Couldn’t check' ) }
			</DomainSuggestionBadge>
		);
	}

	if ( isAvailable && isPremium ) {
		badges.push(
			<DomainSuggestionBadge key="premium" variation="warning">
				{ __( 'Premium' ) }
			</DomainSuggestionBadge>
		);
	}

	const price = isAvailable && yearlyPrice && (
		<DomainSuggestionPrice
			price={ yearlyPrice }
			salePrice={ salePrice }
			renewPrice={ yearlyPrice }
		/>
	);

	const getCta = () => {
		if ( ! isAvailable ) {
			return null;
		}

		if ( error ) {
			return <DomainSuggestionErrorCTA errorMessage={ error.message } callback={ toggleCart } />;
		}

		return (
			<DomainSuggestionPrimaryCTA
				onClick={ toggleCart }
				isBusy={ isPending }
				disabled={ isPending }
				label={ inCart ? __( 'Remove from cart' ) : undefined }
			>
				{ inCart ? __( 'Remove' ) : undefined }
			</DomainSuggestionPrimaryCTA>
		);
	};

	return (
		<div
			className="name-pulse-fqdn-card"
			role="list"
			data-domain={ domainName }
			data-status={ NamePulseDomainStatus[ status ].toLowerCase() }
		>
			<DomainSuggestion.Featured
				isSingleFeaturedSuggestion
				isHighlighted={ isAvailable }
				domain={ label }
				tld={ suffix }
				badges={ badges }
				price={ price }
				cta={ getCta() }
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

	return <FqdnCard result={ result } onUpdate={ onUpdate ?? ( () => {} ) } />;
};
