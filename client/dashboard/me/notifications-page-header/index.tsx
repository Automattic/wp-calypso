import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { notificationsIndexRoute } from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

export default function NotificationsPageHeader( props: PageHeaderProps ) {
	const router = useRouter();

	return (
		<PageHeader
			prefix={
				<PageHeader.SubNavigation
					items={ [
						{
							label: __( 'Notifications' ),
							href: router.buildLocation( {
								to: notificationsIndexRoute.fullPath,
							} ).href,
						},
					] }
				/>
			}
			{ ...props }
		/>
	);
}
