import { domainQuery } from '@automattic/api-queries';
import { getTld } from '@automattic/domain-search';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { formatDistanceToNowStrict } from 'date-fns';
import UnknownError from '../app/500';
import { domainRoute } from '../app/router/domains';
import Notice from '../components/notice';
import { isTldInMaintenance } from '../utils/domain';

export const TLDMaintenanceNotice = ( { showGoBackLink = true }: { showGoBackLink?: boolean } ) => {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<Notice
			variant="warning"
			actions={
				showGoBackLink ? (
					<Link to={ domainRoute.fullPath } params={ { domainName } }>
						{ __( 'Go back to domain overview' ) }
					</Link>
				) : undefined
			}
		>
			{ sprintf(
				/* translators: %(tld)s is the domain's TLD, %(maintenanceEnd)s is the maintenance end time */
				__(
					'The .%(tld)s TLD is under scheduled maintenance. Your domain continues to work normally, but changes to name servers, DNSSEC, contacts, or registration settings are unavailable until maintenance ends (estimated: %(maintenanceEnd)s).'
				),
				{
					tld: getTld( domain.domain ),
					maintenanceEnd: formatDistanceToNowStrict(
						new Date( domain.tld_maintenance_end_time * 1000 ),
						{
							addSuffix: true,
						}
					),
				}
			) }
		</Notice>
	);
};

export const TLDMaintenanceNoticeLayout = ( {
	error,
	children,
}: {
	error: Error;
	children: ( { maintenanceNotice }: { maintenanceNotice: React.ReactNode } ) => React.ReactNode;
} ) => {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	if ( ! isTldInMaintenance( domain ) ) {
		return <UnknownError error={ error } />;
	}

	return children( {
		maintenanceNotice: <TLDMaintenanceNotice />,
	} );
};
