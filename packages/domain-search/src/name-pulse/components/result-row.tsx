import { __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { useNamePulseAddToCart } from '../hooks/use-name-pulse-add-to-cart';
import { NamePulseCartButton } from './cart-button';
import { Price } from './price';
import { getResultBadges, NamePulseResultBadges } from './result-badges';

interface NamePulseResultRowProps {
	result: NamePulseDomainResult;
	position: number;
	/** Receives the real-time verdict so every copy of the row reflects it. */
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

export const NamePulseResultRow = ( { result, position, onUpdate }: NamePulseResultRowProps ) => {
	const { __ } = useI18n();
	const { domain_name: domainName, suffix, status } = result;
	const addToCart = useNamePulseAddToCart( domainName, position, onUpdate );
	const label = suffix ? domainName.slice( 0, -( suffix.length + 1 ) ) : domainName;

	const isWaiting = status === NamePulseDomainStatus.WAITING;
	const isUnknown = status === NamePulseDomainStatus.UNKNOWN;
	const isAvailable = status === NamePulseDomainStatus.AVAILABLE;
	const isUnavailable = ! isWaiting && ! isUnknown && ! isAvailable;
	const badges = getResultBadges( result );

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
				<NamePulseResultBadges { ...badges } />
			</span>
			<span className="name-pulse-row__status">
				{ isWaiting && (
					<span className="name-pulse-row__skeleton" role="img" aria-label={ __( 'Checking…' ) } />
				) }
				{ isUnknown && <Text variant="muted">{ __( 'Couldn’t check' ) }</Text> }
				{ isUnavailable && <Text variant="muted">{ __( 'Unavailable' ) }</Text> }
				{ isAvailable && (
					<>
						{ ! badges.premium && <Price result={ result } /> }
						<NamePulseCartButton domainName={ domainName } size="compact" { ...addToCart } />
					</>
				) }
			</span>
			{ addToCart.error && (
				<Text className="name-pulse-row__error" variant="muted" size={ 12 }>
					{ addToCart.error.message }
				</Text>
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
