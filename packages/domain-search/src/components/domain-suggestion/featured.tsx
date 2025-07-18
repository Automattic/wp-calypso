import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';

import './featured.scss';

type DomainSuggestionFeaturedProps = {
	uuid: string;
	domain: string;
	tld: string;
	matchReasons?: string[];
	badges?: React.ReactNode;
	price: React.ReactNode;
	isHighlighted?: boolean;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

export const Featured = ( {
	uuid,
	domain,
	tld,
	matchReasons,
	badges,
	price,
	isHighlighted,
	onClick,
	disabled,
}: DomainSuggestionFeaturedProps ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const contextValue = useMemo(
		() =>
			( {
				activeQuery,
				alignment: ! matchReasons ? 'left' : undefined,
				priceSize: activeQuery === 'large' ? 20 : 18,
			} ) as const,
		[ activeQuery, matchReasons ]
	);

	const cta = <DomainSuggestionCTA onClick={ onClick } disabled={ disabled } uuid={ uuid } />;

	const title = (
		<Text size={ activeQuery === 'large' ? 32 : 24 } style={ { wordBreak: 'break-all' } }>
			{ domain }.{ tld }
		</Text>
	);

	const badgesElement = badges && (
		<div className="domain-suggestion-featured__badges">{ badges }</div>
	);

	const matchReasonsList = matchReasons && (
		<DomainSuggestionMatchReasons reasons={ matchReasons } />
	);

	const getContent = () => {
		if ( activeQuery === 'large' ) {
			if ( matchReasonsList ) {
				return (
					<VStack spacing={ 3 } className="domain-suggestion-featured__content">
						{ badgesElement }
						<HStack spacing={ 6 }>
							<VStack spacing={ 3 } alignment="left">
								{ title }
								{ matchReasonsList }
							</VStack>
							<VStack
								spacing={ 6 }
								alignment="right"
								className="domain-suggestion-featured__price-info"
							>
								{ price }
								{ cta }
							</VStack>
						</HStack>
					</VStack>
				);
			}

			return (
				<VStack spacing={ 3 } className="domain-suggestion-featured__content">
					<VStack spacing={ 3 } alignment="left">
						{ badgesElement }
						{ title }
					</VStack>
					<HStack>
						{ price }
						{ cta }
					</HStack>
				</VStack>
			);
		}

		return (
			<VStack spacing={ 4 } className="domain-suggestion-featured__content--small">
				<VStack spacing={ 3 }>
					{ badgesElement }
					{ title }
					{ price }
					{ matchReasonsList }
				</VStack>
				{ cta }
			</VStack>
		);
	};

	return (
		<Card
			ref={ containerRef }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
			className={ clsx( 'domain-suggestion-featured', {
				'domain-suggestion-featured--highlighted': isHighlighted,
			} ) }
		>
			<DomainSuggestionContainerContext.Provider value={ contextValue }>
				<CardBody className="domain-suggestion-featured__body">{ getContent() }</CardBody>
			</DomainSuggestionContainerContext.Provider>
		</Card>
	);
};
