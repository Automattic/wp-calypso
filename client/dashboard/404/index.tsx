import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function NotFound() {
	return (
		<PageLayout
			title={ __( '404 Not Found' ) }
			description={ __( 'The page you are looking for does not exist.' ) }
			actions={
				<Button __next40pxDefaultSize variant="primary" href="sites">
					{ __( 'Go to Sites' ) }
				</Button>
			}
		/>
	);
}

export default NotFound;
