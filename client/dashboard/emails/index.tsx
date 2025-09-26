import { Email } from '@automattic/api-core';
import { emailsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { useMemo, useState } from 'react';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import '../sites/emails/styles.scss';
import { createEmailActions, DEFAULT_EMAILS_VIEW, emailFields } from './dataviews';
import type { View } from '@wordpress/dataviews';

function Emails() {
	const navigate = useNavigate();
	const { data: allEmails, isLoading } = useQuery( emailsQuery() );
	const emails = allEmails ?? [];

	const [ selection, setSelection ] = useState< Email[] >( [] );
	const [ view, setView ] = useState< View >( DEFAULT_EMAILS_VIEW );

	const actions = useMemo(
		() => createEmailActions( navigate, setSelection ),
		[ navigate, setSelection ]
	);

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( emails, view, emailFields );

	return (
		<PageLayout header={ <PageHeader /> } notices={ <OptInWelcome tracksContext="emails" /> }>
			<DataViewsCard>
				<DataViews
					data={ filteredData }
					isLoading={ isLoading }
					fields={ emailFields }
					view={ view }
					onChangeView={ setView }
					selection={ selection.map( ( item ) => item.id ) }
					onChangeSelection={ ( ids ) =>
						setSelection( emails.filter( ( email ) => ids.includes( email.id ) ) )
					}
					actions={ actions }
					defaultLayouts={ { table: {} } }
					paginationInfo={ paginationInfo }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default Emails;
