import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';
import RouterLinkButton from '../router-link-button';

function NotFound() {
	return (
		<PageLayout
			title={ __( '404 Not Found' ) }
			description={ __( 'The page you are looking for does not exist.' ) }
			actions={
				<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
					{ __( 'Go to Sites' ) }
				</RouterLinkButton>
			}
		/>
	);
}

export default NotFound;
