import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function SecurityLegacyContact() {
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Legacy Contact' ) }
					description={ __(
						'A legacy contact is someone you trust to have access to your account after your death.'
					) }
				/>
			}
		>
			{ /* Content goes here */ }
		</PageLayout>
	);
}
