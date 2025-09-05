import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { siteRoute } from '../../app/router/sites';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

interface SettingsPageHeaderProps extends PageHeaderProps {
	backPath?: string;
	backLabel?: string;
}

export default function SettingsPageHeader( props: SettingsPageHeaderProps ) {
	const { siteSlug } = siteRoute.useParams();
	const { backPath, backLabel, ...pageHeaderProps } = props;
	const router = useRouter();

	const defaultBackPath = `/sites/${ siteSlug }/settings`;
	const defaultBackLabel = __( 'Settings' );

	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( { to: backPath || defaultBackPath } );
			} }
		>
			{ backLabel || defaultBackLabel }
		</Button>
	);

	return <PageHeader prefix={ backButton } { ...pageHeaderProps } />;
}
