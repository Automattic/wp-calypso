import { Button, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { MailboxForm } from './components/mailbox-form';

const AddProfessionalEmail = () => {
	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Card>
				<CardBody>
					<MailboxForm disabled={ false } />
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button __next40pxDefaultSize variant="secondary" onClick={ () => {} }>
					{ __( 'Add another mailbox' ) }
				</Button>
			</ButtonStack>

			<ButtonStack justify="flex-start">
				<Button __next40pxDefaultSize variant="primary" onClick={ () => {} }>
					{ __( 'Continue' ) }
				</Button>
			</ButtonStack>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
