import { useSuspenseQuery } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { domainQuery } from '../../app/queries/domain';
import { domainRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';

export default function DomainOverview() {
	const locale = useLocale();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ domainName }
					// translators: date is the date the domain was registered.
					description={ sprintf( __( 'Registered on %(date)s' ), {
						date: formatDate( new Date( domain.registration_date ), locale, { dateStyle: 'long' } ),
					} ) }
				/>
			}
		></PageLayout>
	);
}
