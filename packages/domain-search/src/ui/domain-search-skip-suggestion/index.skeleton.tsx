import { Card, CardBody } from '@wordpress/components';
import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

interface Props extends Omit< ComponentProps< typeof Card >, 'children' | 'title' | 'size' > {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	right?: React.ReactNode;
	activeQuery: 'small' | 'large';
}

export const DomainSearchSkipSuggestionSkeleton = forwardRef< HTMLDivElement, Props >(
	( { title, subtitle, right, activeQuery, ...cardProps }, ref ) => (
		<Card
			{ ...cardProps }
			className="domain-search-skip-suggestion"
			ref={ ref }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
		>
			<CardBody>
				<div className="domain-search-skip-suggestion__content">
					{ title }
					{ subtitle }
				</div>
				{ right }
			</CardBody>
		</Card>
	)
);

DomainSearchSkipSuggestionSkeleton.displayName = 'DomainSearchSkipSuggestionSkeleton';
