import { LoadingPlaceholder } from '@automattic/components';
import { useDomainSuggestionContainer } from '../../hooks/use-domain-suggestion-container';
import { FeaturedSkeleton } from './featured.skeleton';

export const FeaturedPlaceholder = () => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	return (
		<FeaturedSkeleton
			ref={ containerRef }
			activeQuery={ activeQuery }
			badges={ <LoadingPlaceholder width="6.3125rem" height="1.5rem" /> }
			title={ <LoadingPlaceholder width="11.625rem" height="2.5rem" /> }
			matchReasonsList={ <LoadingPlaceholder width="11.625rem" height="1.25rem" /> }
			price={ null }
			cta={
				<LoadingPlaceholder
					width={ activeQuery === 'large' ? '7.875rem' : '100%' }
					height="2.5rem"
				/>
			}
		/>
	);
};
