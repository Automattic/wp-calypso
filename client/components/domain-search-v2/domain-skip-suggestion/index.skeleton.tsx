import { Card, CardBody } from '@wordpress/components';

interface Props {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	right?: React.ReactNode;
}

export const DomainSkipSkeleton = ( { title, subtitle, right }: Props ) => {
	return (
		<Card className="subdomain-skip-suggestion">
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
