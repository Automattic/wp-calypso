import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { billingIndexRoute } from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

export default function BillingPageHeader( props: PageHeaderProps ) {
	const router = useRouter();

	return (
		<PageHeader
			prefix={
				<PageHeader.SubNavigation
					items={ [
						{
							label: __( 'Billing' ),
							href: router.buildLocation( {
								to: billingIndexRoute.fullPath,
							} ).href,
						},
					] }
				/>
			}
			{ ...props }
		/>
	);
}
