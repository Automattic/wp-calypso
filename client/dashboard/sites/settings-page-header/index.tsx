import { useRouter, useCanGoBack } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { siteRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import type { PageHeaderProps } from '../../components/page-header/types';

export default function SettingsPageHeader( props: PageHeaderProps ) {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();
	const canGoBack = useCanGoBack();
	const backUrl = `/sites/${ siteSlug }/settings`;

	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				canGoBack ? router.history.back() : router.navigate( { to: backUrl } );
			} }
		>
			{ canGoBack &&
			! router.options.context.previousLocationRef?.current?.pathname.endsWith( backUrl )
				? __( 'Back' )
				: __( 'Settings' ) }
		</Button>
	);

	return <PageHeader prefix={ backButton } { ...props } />;
}
