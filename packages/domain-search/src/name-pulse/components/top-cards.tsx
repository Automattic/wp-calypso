import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { cart as cartIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import {
	DomainSearchTrademarkClaimsModal,
	DomainSuggestion,
	DomainSuggestionBadge,
	DomainSuggestionPrice,
	FeaturedDomainSuggestionsList,
} from '../../ui';
import {
	NAME_PULSE_TOP_RESULTS_COUNT,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';
import { getResultPrices, hasSalePrice } from './price';

interface NamePulseTopCardProps {
	result: NamePulseDomainResult;
	position: number;
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

const NamePulseTopCard = ( { result, position, onUpdate }: NamePulseTopCardProps ) => {
	const { __ } = useI18n();
	const {
		inCart,
		isPending,
		error,
		toggleCart,
		trademarkClaimsNoticeInfo,
		acceptTrademarkClaim,
		dismissTrademarkClaim,
	} = useNamePulseAddToCart( result, position, onUpdate );

	const {
		domain_name: domainName,
		suffix,
		status,
		is_premium: isPremium,
		is_realtime: isRealtime,
	} = result;
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;
	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const showPremiumBadge = isAvailable && isPremium && ! isRealtime;
	const prices = isAvailable && ! showPremiumBadge ? getResultPrices( result ) : undefined;

	const badges = [
		isAvailable && hasSalePrice( result ) && (
			<DomainSuggestionBadge key="sale" variation="warning">
				{ __( 'Sale' ) }
			</DomainSuggestionBadge>
		),
		showPremiumBadge && (
			<DomainSuggestionBadge key="premium" variation="warning">
				{ __( 'Premium' ) }
			</DomainSuggestionBadge>
		),
	].filter( Boolean );

	return (
		<DomainSuggestion.Featured
			domain={ label }
			tld={ suffix }
			badges={ badges.length > 0 ? badges : undefined }
			price={
				<>
					{ isWaiting && (
						<span
							className="name-pulse-row__skeleton"
							role="img"
							aria-label={ __( 'Checking…' ) }
						/>
					) }
					{ prices && (
						<DomainSuggestionPrice
							price={ prices.yearlyPrice }
							salePrice={ prices.salePrice }
							renewPrice={ prices.yearlyPrice }
						/>
					) }
				</>
			}
			cta={
				isAvailable && (
					<div className="name-pulse-card__cta">
						{ error && (
							<Text variant="muted" size={ 12 }>
								{ error.message }
							</Text>
						) }
						<Button
							className="name-pulse-row__cart"
							icon={ cartIcon }
							label={ inCart ? __( 'Remove from cart' ) : __( 'Add to cart' ) }
							variant={ inCart ? 'primary' : undefined }
							isBusy={ isPending }
							disabled={ isPending }
							aria-pressed={ inCart }
							onClick={ toggleCart }
						/>
						{ trademarkClaimsNoticeInfo && (
							<DomainSearchTrademarkClaimsModal
								domainName={ domainName }
								trademarkClaimsNoticeInfo={ trademarkClaimsNoticeInfo }
								onAccept={ acceptTrademarkClaim }
								onClose={ dismissTrademarkClaim }
							/>
						) }
					</div>
				)
			}
		/>
	);
};

interface NamePulseTopCardsProps {
	results: NamePulseDomainResult[];
	isLoading?: boolean;
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

export const NamePulseTopCards = ( { results, isLoading, onUpdate }: NamePulseTopCardsProps ) => {
	const { __ } = useI18n();
	const visible = results.slice( 0, NAME_PULSE_TOP_RESULTS_COUNT );
	const skeletons = isLoading ? NAME_PULSE_TOP_RESULTS_COUNT - visible.length : 0;

	if ( visible.length === 0 && skeletons === 0 ) {
		return null;
	}

	return (
		<VStack spacing={ 3 } className="name-pulse-section name-pulse-top-cards" data-section="top">
			<Text as="h2" size={ 15 } weight={ 500 }>
				{ __( 'Top results' ) }
			</Text>
			<FeaturedDomainSuggestionsList>
				{ visible.map( ( result, index ) => (
					<NamePulseTopCard
						key={ result.domain_name }
						result={ result }
						position={ index }
						onUpdate={ onUpdate }
					/>
				) ) }
				{ Array.from( { length: skeletons }, ( _, index ) => (
					<DomainSuggestion.Featured.Placeholder key={ `skeleton-${ index }` } />
				) ) }
			</FeaturedDomainSuggestionsList>
		</VStack>
	);
};
