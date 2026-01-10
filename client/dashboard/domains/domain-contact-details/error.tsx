import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import Notice from '../../components/notice';
import { TLDMaintenanceNoticeLayout } from '../maintenance-notice';
import { ContactDetailsLayout } from './layout';

export default function ContactDetailsError( { error }: { error: Error } ) {
	const handleRetry = () => {
		// Reload the page to retry loading the data
		window.location.reload();
	};

	return (
		<TLDMaintenanceNoticeLayout error={ error }>
			{ ( { maintenanceNotice } ) => (
				<ContactDetailsLayout notices={ maintenanceNotice } isCtaDisabled>
					<Card>
						<CardBody>
							<VStack spacing={ 4 }>
								<Notice variant="error">
									<VStack spacing={ 2 }>
										<div>
											<strong>{ __( 'Unable to load contact details' ) }</strong>
										</div>
										<div>
											{ __(
												'There was an error loading the contact information for this domain. Please try again.'
											) }
										</div>
										<div>
											<Button variant="secondary" onClick={ handleRetry }>
												{ __( 'Try again' ) }
											</Button>
										</div>
									</VStack>
								</Notice>

								{ /* Show error details in development */ }
								{ process.env.NODE_ENV === 'development' && (
									<details>
										<summary>{ __( 'Error details (development only)' ) }</summary>
										<pre style={ { fontSize: '12px', color: '#666' } }>
											{ error.message }
											{ error.stack && `\n\n${ error.stack }` }
										</pre>
									</details>
								) }
							</VStack>
						</CardBody>
					</Card>
				</ContactDetailsLayout>
			) }
		</TLDMaintenanceNoticeLayout>
	);
}
