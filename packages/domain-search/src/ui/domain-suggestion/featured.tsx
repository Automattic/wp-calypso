import { __experimentalText as Text } from '@wordpress/components';
import clsx from 'clsx';
import { useMemo } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';
import { DomainSuggestionMatchReasons } from '../domain-suggestion-match-reasons';
import { FeaturedPlaceholder } from './featured.placeholder';
import { FeaturedSkeleton } from './featured.skeleton';

import './featured.scss';

export const getForcedPriceAlignment = ( {
	activeQuery,
	isSingleFeaturedSuggestion,
	matchReasons,
}: {
	activeQuery: 'small' | 'large';
	isSingleFeaturedSuggestion?: boolean;
	matchReasons?: string[];
} ) => {
	if ( activeQuery === 'large' && isSingleFeaturedSuggestion ) {
		return 'right';
	}

	if ( ! matchReasons ) {
		return 'left';
	}

	return undefined;
};

type DomainSuggestionFeaturedProps = {
	domain: string;
	tld: string;
	matchReasons?: string[];
	badges?: React.ReactNode;
	price: React.ReactNode;
	isHighlighted?: boolean;
	cta: React.ReactNode;
	isSingleFeaturedSuggestion?: boolean;
};

const Featured = ( {
	domain,
	tld,
	matchReasons,
	badges,
	price,
	isHighlighted,
	cta,
	isSingleFeaturedSuggestion,
}: DomainSuggestionFeaturedProps ) => {
	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();

	const contextValue = useMemo(
		() =>
			( {
				activeQuery,
				priceAlignment: getForcedPriceAlignment( {
					activeQuery,
					isSingleFeaturedSuggestion,
					matchReasons,
				} ),
				priceSize: activeQuery === 'large' ? 20 : 18,
				isFeatured: true,
				currentWidth: currentWidth,
			} ) as const,
		[ activeQuery, matchReasons, isSingleFeaturedSuggestion, currentWidth ]
	);

	const domainName = (
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
				role="listitem"
				title={ `${ domain }.${ tld }` }
				ref={ containerRef }
				activeQuery={ activeQuery }
				className={ clsx( 'domain-suggestion-featured', {
					'domain-suggestion-featured--highlighted': isHighlighted,
					'domain-suggestion-featured--single': isSingleFeaturedSuggestion,
				} ) }
				badges={ badgesElement }
				domainName={ domainName }
				matchReasonsList={ matchReasonsList }
				price={ price }
				cta={ cta }
				isSingleFeaturedSuggestion={ isSingleFeaturedSuggestion }
			/>
		</DomainSuggestionContainerContext.Provider>
	);
};

Featured.Placeholder = FeaturedPlaceholder;

export { Featured };
