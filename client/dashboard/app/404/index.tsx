import { useRouter } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { sitesRoute } from '../router/sites';

function NotFound() {
	const router = useRouter();

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( '404 Not Found' ) }
					description={ __( 'The page you are looking for does not exist.' ) }
					actions={
						<Button
							variant="primary"
							__next40pxDefaultSize
							href={
								router.buildLocation( {
									to: sitesRoute.fullPath,
								} ).href
							}
						>
							{ __( 'Go to Sites' ) }
						</Button>
					}
				/>
			}
		/>
	);
}

export default NotFound;
