import { __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import { ComponentProps, useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionCTA } from '../domain-suggestion-cta';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';
import { FeaturedPlaceholder } from './featured.placeholder';
import { FeaturedSkeleton } from './featured.skeleton';

import './featured.scss';

type DomainSuggestionFeaturedProps = {
	uuid: string;
	domain: string;
	tld: string;
	matchReasons?: string[];
	badges?: React.ReactNode;
	price: React.ReactNode;
	isHighlighted?: boolean;
	cta?: React.ReactNode;
	isSingleFeaturedSuggestion?: boolean;
} & Pick< ComponentProps< typeof DomainSuggestionCTA >, 'onClick' | 'disabled' >;

const Featured = ( {
	uuid,
	domain,
	tld,
	matchReasons,
	badges,
	price,
	isHighlighted,
	onClick,
	disabled,
	cta,
	isSingleFeaturedSuggestion,
}: DomainSuggestionFeaturedProps ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	const contextValue = useMemo(
		() =>
			( {
				activeQuery,
				priceAlignment:
					// eslint-disable-next-line no-nested-ternary
					activeQuery === 'large' && isSingleFeaturedSuggestion
						? 'right'
						: ! matchReasons
						? 'left'
						: undefined,
				priceSize: activeQuery === 'large' ? 20 : 18,
				isFeatured: true,
			} ) as const,
		[ activeQuery, matchReasons, isSingleFeaturedSuggestion ]
	);

	const title = (
		<Text size={ activeQuery === 'large' ? 32 : 24 } style={ { wordBreak: 'break-all' } }>
			{ domain }
			<span style={ { whiteSpace: 'nowrap' } }>.{ tld }</span>
		</Text>
	);

	const badgesElement = badges && (
		<div className="domain-suggestion-featured__badges">{ badges }</div>
	);

	const matchReasonsList = matchReasons && (
		<DomainSuggestionMatchReasons reasons={ matchReasons } />
	);

	return (
		<DomainSuggestionContainerContext.Provider value={ contextValue }>
			<FeaturedSkeleton
				ref={ containerRef }
				activeQuery={ activeQuery }
				className={ clsx( 'domain-suggestion-featured', {
					'domain-suggestion-featured--highlighted': isHighlighted,
				} ) }
				badges={ badgesElement }
				title={ title }
				matchReasonsList={ matchReasonsList }
				price={ price }
				cta={
					cta ?? <DomainSuggestionCTA onClick={ onClick } disabled={ disabled } uuid={ uuid } />
				}
				isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
			/>
		</DomainSuggestionContainerContext.Provider>
	);
};

Featured.Placeholder = FeaturedPlaceholder;

export { Featured };
