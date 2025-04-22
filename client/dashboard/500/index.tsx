import { Button, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../page-layout';

function UnknownError( { error }: { error: Error } ) {
	return (
		<PageLayout
			title={ __( '500 Error' ) }
			description={ __( 'Something wrong happened.' ) }
			actions={
				<Button __next40pxDefaultSize variant="primary" href="sites">
					{ __( 'Go to Sites' ) }
				</Button>
			}
		>
			<Notice status="error" isDismissible={ false }>
				{ error.message }
			</Notice>
		</PageLayout>
	);
}

export default UnknownError;
