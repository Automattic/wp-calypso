import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function NotFound() {
	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( '404 Not Found' ) }
					description={ __( 'The page you are looking for does not exist.' ) }
				/>
			}
		/>
	);
}

export default NotFound;
