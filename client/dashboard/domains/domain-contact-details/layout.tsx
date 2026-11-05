import { useHasEnTranslation } from '@automattic/i18n-utils';
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
	const hasEnTranslation = useHasEnTranslation();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={
						hasEnTranslation(
							'Update your domain’s contact information for registration, and what the public can see.'
						)
							? __(
									'Update your domain’s contact information for registration, and what the public can see.'
								)
							: __( 'Update your domain’s contact information for registration.' )
					}
				/>
			}
			notices={ notices }
		>
			{ children }
		</PageLayout>
	);
};
