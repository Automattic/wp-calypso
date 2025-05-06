import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';

function UnknownError( { error }: { error: Error } ) {
	return (
		<PageLayout
			title={ __( '500 Error' ) }
			description={ __( 'Something wrong happened.' ) }
			actions={
				<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
					{ __( 'Go to Sites' ) }
				</RouterLinkButton>
			}
		>
			<Notice status="error" isDismissible={ false }>
				{ error.message }
			</Notice>
		</PageLayout>
	);
}

export default UnknownError;
