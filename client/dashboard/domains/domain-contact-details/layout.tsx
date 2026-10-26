import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export const DomainContactDetailsLayout = ( {
	notices,
	children,
}: {
	notices?: React.ReactNode;
	children?: React.ReactNode;
} ) => {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ __(
						'Update your domain’s contact information for registration, and what the public can see.'
					) }
				/>
			}
			notices={ notices }
		>
			{ children }
		</PageLayout>
	);
};
