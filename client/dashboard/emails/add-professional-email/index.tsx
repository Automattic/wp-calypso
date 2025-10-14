import { useRouter } from '@tanstack/react-router';
import { Button, Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { IntervalLength } from '../types';
import { MailboxForm } from './components/mailbox-form';

const AddProfessionalEmail = () => {
	const router = useRouter();
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	let interval: IntervalLength = router.state.location.search.interval;
	if ( interval !== 'monthly' && interval !== 'annually' ) {
		interval = 'annually';
	}

	const handleSubmit = async () => {
		setIsSubmitting( true );
	};

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Card>
				<CardBody>
					<MailboxForm disabled={ isSubmitting } />
				</CardBody>
			</Card>

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="secondary"
					disabled={ isSubmitting }
					onClick={ () => {} }
				>
					{ __( 'Add another mailbox' ) }
				</Button>
			</ButtonStack>

			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ isSubmitting }
					onClick={ handleSubmit }
				>
					{ __( 'Continue' ) }
				</Button>
			</ButtonStack>
		</PageLayout>
	);
};

export default AddProfessionalEmail;
