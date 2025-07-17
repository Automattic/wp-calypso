import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionBadge } from '../domain-suggestion-badge';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';

import './recommended-fqdn.scss';

type DomainSuggestionRecommendedFQDNProps = {
	uuid: string;
	domain: string;
	tld: string;
	matchReasons: string[];
	price: React.ReactNode;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

export const RecommendedFQDN = ( {
	uuid,
	domain,
	tld,
	matchReasons,
	price,
	onClick,
	disabled,
}: DomainSuggestionRecommendedFQDNProps ) => {
	const { __ } = useI18n();
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const contextValue = useMemo( () => ( { activeQuery } ), [ activeQuery ] );

	const cta = <DomainSuggestionCTA onClick={ onClick } disabled={ disabled } uuid={ uuid } />;

	const title = (
		<Text size={ activeQuery === 'large' ? 32 : 24 }>
			{ domain }.{ tld }
		</Text>
	);

	const availableBadge = (
		<DomainSuggestionBadge variation="success">{ __( 'It’s available!' ) }</DomainSuggestionBadge>
	);

	const matchReasonsList = <DomainSuggestionMatchReasons reasons={ matchReasons } />;

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			return (
				<HStack spacing={ 6 }>
					<VStack spacing={ 3 } alignment="left">
						<div>{ availableBadge }</div>
						{ title }
						{ matchReasonsList }
					</VStack>
					<VStack
						spacing={ 6 }
						alignment="right"
						className="domain-suggestion-recommended--fqdn__price-info"
					>
						{ price }
						{ cta }
					</VStack>
				</HStack>
			);
		}

		return (
			<VStack spacing={ 3 }>
				<div>{ availableBadge }</div>
				{ title }
				{ price }
				{ matchReasonsList }
				{ cta }
			</VStack>
		);
	};

	return (
		<Card
			ref={ containerRef }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
			className="domain-suggestion-recommended--fqdn"
		>
			<DomainSuggestionContainerContext.Provider value={ contextValue }>
				<CardBody>{ getContent() }</CardBody>
			</DomainSuggestionContainerContext.Provider>
		</Card>
	);
};
