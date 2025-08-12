import { useDomainSuggestionContainer } from '@automattic/domain-search';
import { Card, CardBody } from '@wordpress/components';

interface Props {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	right?: React.ReactNode;
}

export const DomainSkipSkeleton = ( { title, subtitle, right }: Props ) => {
	const { containerRef, activeQuery } = useDomainSuggestionContainer();

	return (
		<Card
			className="subdomain-skip-suggestion"
			ref={ containerRef }
			size={ activeQuery === 'large' ? 'medium' : 'small' }
		>
			<CardBody>
				<div className="subdomain-skip-suggestion__content">
					{ title }
					{ subtitle }
				</div>
				{ right }
			</CardBody>
		</Card>
	);
};
