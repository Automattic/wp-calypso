import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { domainRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DomainPermissionError } from '../../utils/domain-permissions';

export default function DomainError( { error }: { error: Error } ) {
	if ( ! ( error instanceof DomainPermissionError ) ) {
		return <UnknownError error={ error } />;
	}

	const { domainName } = domainRoute.useParams();

	return (
		<PageLayout
			header={ <PageHeader title={ domainName } /> }
			notices={
				<Notice
					variant="warning"
					actions={
						<Link to={ domainRoute.fullPath } params={ { domainName } }>
							{ __( 'Go back to domain overview' ) }
						</Link>
					}
				>
					{ error.message }
				</Notice>
			}
		/>
	);
}
