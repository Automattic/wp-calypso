import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function NotFound() {
	const to = '/sites';
	const navigate = useNavigate();
	const router = useRouter();
	const href = router.buildLocation( {
		to,
	} ).href;

	return (
		<PageLayout
			title={ __( '404 Not Found' ) }
			description={ __( 'The page you are looking for does not exist.' ) }
			actions={
				<Button
					__next40pxDefaultSize
					variant="primary"
					href={ href }
					onClick={ ( event: React.MouseEvent ) => {
						event.preventDefault();
						navigate( { to } );
					} }
				>
					{ __( 'Go to Sites' ) }
				</Button>
			}
		/>
	);
}

export default NotFound;
