import { __ } from '@wordpress/i18n';
import NotFound from '../../app/404';
import UnknownError from '../../app/500';
import { domainRoute } from '../../app/router/domains';
import Notice, { RouterNoticeActionLink } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DomainPermissionError } from '../../utils/domain-permissions';
import { toError } from '../../utils/to-error';

export default function DomainError( { error: thrown }: { error: unknown } ) {
	const error = toError( thrown );
	const { domainName } = domainRoute.useParams();

	if ( error.name === 'InvalidDomainError' ) {
		return <NotFound />;
	}

	if ( ! ( error instanceof DomainPermissionError ) ) {
		return <UnknownError error={ error } />;
	}

	return (
		<PageLayout
			header={ <PageHeader title={ domainName } /> }
			notices={
				<Notice
					variant="warning"
					actions={
						<RouterNoticeActionLink to="/domains">
							{ __( 'Go back to domains' ) }
						</RouterNoticeActionLink>
					}
				>
					{ error.message }
				</Notice>
			}
		/>
	);
}
