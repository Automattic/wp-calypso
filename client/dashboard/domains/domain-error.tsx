import { Card, CardBody } from '../components/card';
import Notice from '../components/notice';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

interface DomainErrorProps {
	error: Error;
	title: string;
}

// In case we need to display a domain-specific error page e.g. Name Servers, Glue Records, etc.
// this is a domain-specific error component shared between all domain subroutes
export default function DomainError( { error, title }: DomainErrorProps ) {
	return (
		<PageLayout size="small" header={ <PageHeader title={ title } /> }>
			<Card>
				<CardBody>
					<Notice variant="error">{ error.message }</Notice>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

// Factory function to create domain-specific error components
export function createDomainErrorComponent( title: string ) {
	return function DomainSpecificError( { error }: { error: Error } ) {
		return <DomainError error={ error } title={ title } />;
	};
}
