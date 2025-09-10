import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function SecurityTwoStepAuthAppPageLayout( {
	children,
}: {
	children: React.ReactNode;
} ) {
	const router = useRouter();

	// TODO: Replace with breadcrumb
	const backButton = (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( { to: '/me/security/two-step-auth' } );
			} }
		>
			{ __( 'Security' ) }
		</Button>
	);
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ backButton } title={ __( 'Set up two-step authentication' ) } />
			}
		>
			{ children }
		</PageLayout>
	);
}
