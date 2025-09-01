import { isWpError } from '@automattic/api-core';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	Icon,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { envelope } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { requestDpaMutation } from '../../app/queries/me-dpa';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

export default function DpaCard() {
	const mutation = useMutation( requestDpaMutation() );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleClick = () => {
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'We’ve sent you our DPA via email.' ), {
					icon: <Icon icon={ envelope } style={ { fill: 'currentcolor' } } />,
					type: 'snackbar',
				} );
			},
			onError: ( e: Error ) => {
				createErrorNotice(
					isWpError( e ) && e.error === 'too_many_requests'
						? e.message
						: __( 'There was an error requesting a DPA.' ),
					{ type: 'snackbar' }
				);
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Data processing addendum' ) }
						description={
							<VStack spacing={ 4 }>
								<Text variant="muted" lineHeight="20px">
									{ __(
										'A Data Processing Addendum (DPA) allows web sites and companies to assure customers, vendors, and partners that their data handling complies with the law.'
									) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ __( 'Note: Most free site owners or hobbyists do not need a DPA.' ) }
								</Text>
								<Text variant="muted" lineHeight="20px">
									{ __(
										'Having a DPA does not change any of our privacy and security practices for site visitors. Everyone using our service gets the same high standards of privacy and security.'
									) }
								</Text>
							</VStack>
						}
						level={ 3 }
					/>
					<HStack justify="flex-start">
						<Button
							__next40pxDefaultSize
							variant="secondary"
							isBusy={ mutation.isPending }
							onClick={ handleClick }
						>
							{ __( 'Request a DPA' ) }
						</Button>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
