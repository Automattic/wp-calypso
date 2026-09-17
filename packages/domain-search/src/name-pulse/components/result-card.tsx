import { __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { DomainSuggestion, DomainSuggestionPrice } from '../../ui';
import {
	getResultPrices,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';
import { NamePulseCartButton } from './cart-button';
import { getResultBadges, NamePulseResultBadges } from './result-badges';

interface NamePulseResultCardProps {
	result: NamePulseDomainResult;
	position: number;
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

export const NamePulseResultCard = ( { result, position, onUpdate }: NamePulseResultCardProps ) => {
	const { __ } = useI18n();
	const { domain_name: domainName, suffix, status } = result;
	const addToCart = useNamePulseAddToCart( domainName, position, onUpdate );
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const badges = getResultBadges( result );
	const prices = isAvailable && ! badges.premium ? getResultPrices( result ) : undefined;

	return (
		<DomainSuggestion.Featured
			domain={ label }
			tld={ suffix }
			badges={ ( badges.sale || badges.premium ) && <NamePulseResultBadges { ...badges } /> }
			price={
				status === NamePulseDomainStatus.WAITING ? (
					<span className="name-pulse-row__skeleton" role="img" aria-label={ __( 'Checking…' ) } />
				) : (
					prices && (
						<DomainSuggestionPrice
							price={ prices.yearlyPrice }
							salePrice={ prices.salePrice }
							renewPrice={ prices.yearlyPrice }
						/>
					)
				)
			}
			cta={
				isAvailable && (
					<div className="name-pulse-card__cta">
						{ addToCart.error && (
							<Text variant="muted" size={ 12 }>
								{ addToCart.error.message }
							</Text>
						) }
						<NamePulseCartButton domainName={ domainName } { ...addToCart } />
					</div>
				)
			}
		/>
	);
};
