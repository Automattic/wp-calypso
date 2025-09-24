import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { siteSettingsRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

interface SettingsPageHeaderProps extends PageHeaderProps {
	backPath?: string;
	backLabel?: string;
}

export default function SettingsPageHeader( props: SettingsPageHeaderProps ) {
	const { backPath, backLabel, ...pageHeaderProps } = props;
	const router = useRouter();

	return (
		<PageHeader
			prefix={
				<PageHeader.SubNavigation
					items={ [
						{
							label: __( 'Settings' ),
							href: router.buildLocation( {
								to: siteSettingsRoute.fullPath,
							} ).href,
						},
					] }
				/>
			}
			{ ...pageHeaderProps }
		/>
	);
}
