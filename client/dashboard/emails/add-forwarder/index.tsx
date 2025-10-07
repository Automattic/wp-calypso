import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { OptInWelcome } from '../../components/opt-in-welcome';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { Text } from '../../components/text';
import type { Field } from '@wordpress/dataviews';

import '../style.scss';

export interface FormData {
	local_part: string;
	domain: string;
	forwarding_address: string;
}

function AddEmailForwarder() {
	const [
		formData,
		// TODO: setFormData
	] = useState< FormData >( () => {
		return {
			local_part: '',
			domain: '',
			forwarding_address: '',
		};
	} );

	const fields: Field< FormData >[] = [
		{
			id: 'local_part',
			label: __( 'Email address' ),
			type: 'text',
		},
		// TODO: fetch domain options from API
		{
			id: 'domain',
			label: __( 'Domain' ),
			type: 'text',
		},
		{
			id: 'forwarding_address',
			label: __( 'Forward to' ),
			type: 'text',
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [
			{
				children: [ 'local_part', 'domain' ],
				id: 'email_address',
				layout: {
					type: 'row' as const,
				},
			},
			'forwarding_address',
		],
	};

	return (
		<PageLayout
			header={
				<>
					<PageHeader
						prefix={
							<RouterLinkButton
								className="add-forwarder__back-button"
								icon={ arrowLeft }
								iconSize={ 12 }
								to="/emails"
							>
								<Text variant="muted">{ __( 'Emails' ) }</Text>
							</RouterLinkButton>
						}
					/>
				</>
			}
			notices={ <OptInWelcome tracksContext="emails" /> }
			size="small"
		>
			<Card>
				<CardBody>
					<form onSubmit={ () => {} }>
						<VStack spacing={ 6 }>
							<VStack spacing={ 2 }>
								<DataForm data={ formData } fields={ fields } form={ form } onChange={ () => {} } />

								<Text variant="muted">
									{ __( 'Separate multiple email addresses with commas or press the Enter key.' ) }
								</Text>
							</VStack>

							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									// isBusy={ isBusy } disabled={ isBusy }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default AddEmailForwarder;
