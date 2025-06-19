import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

export default function SettingsPageHeader( props: PageHeaderProps ) {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( { to: `/sites/${ siteSlug }/settings` } );
			} }
		>
			{ __( 'Settings' ) }
		</Button>
	);

	return <PageHeader prefix={ backButton } { ...props } />;
}
