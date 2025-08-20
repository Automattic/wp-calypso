import { Card, CardBody } from '@wordpress/components';
import { useDomainSuggestionContainer } from '../../hooks/use-domain-suggestion-container';

interface Props {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	right?: React.ReactNode;
}

export const DomainSearchSkipSuggestionSkeleton = ( { title, subtitle, right }: Props ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	return (
		<Card
			className="domain-search-skip-suggestion"
			ref={ containerRef }
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
	);
};
