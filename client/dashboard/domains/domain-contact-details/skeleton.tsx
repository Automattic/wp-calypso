import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { TextSkeleton } from '../../components/text-skeleton';
import { ContactDetailsLayout } from './layout';

export function ContactDetailsSkeleton() {
	return (
		<ContactDetailsLayout>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Contact details & privacy' ) } level={ 3 } />

						{ /* Domain information skeleton */ }
						<div>
							<p>
								<strong>{ __( 'Domain:' ) }</strong> <TextSkeleton length={ 20 } />
							</p>
							<p>
								<strong>{ __( 'Privacy Protection:' ) }</strong> <TextSkeleton length={ 10 } />
							</p>
						</div>

						{ /* Contact information skeleton */ }
						<VStack spacing={ 3 }>
							<div>
								<h4>{ __( 'Registrant Contact' ) }</h4>
								<VStack spacing={ 1 }>
									<p>
										<strong>{ __( 'Name:' ) }</strong> <TextSkeleton length={ 25 } />
									</p>
									<p>
										<strong>{ __( 'Organization:' ) }</strong> <TextSkeleton length={ 20 } />
									</p>
									<p>
										<strong>{ __( 'Email:' ) }</strong> <TextSkeleton length={ 30 } />
									</p>
									<p>
										<strong>{ __( 'Phone:' ) }</strong> <TextSkeleton length={ 15 } />
									</p>
									<p>
										<strong>{ __( 'Address:' ) }</strong> <TextSkeleton length={ 40 } />
									</p>
								</VStack>
							</div>

							<div>
								<h4>{ __( 'Administrative Contact' ) }</h4>
								<VStack spacing={ 1 }>
									<p>
										<strong>{ __( 'Name:' ) }</strong> <TextSkeleton length={ 25 } />
									</p>
									<p>
										<strong>{ __( 'Organization:' ) }</strong> <TextSkeleton length={ 20 } />
									</p>
									<p>
										<strong>{ __( 'Email:' ) }</strong> <TextSkeleton length={ 30 } />
									</p>
								</VStack>
							</div>

							<div>
								<h4>{ __( 'Technical Contact' ) }</h4>
								<VStack spacing={ 1 }>
									<p>
										<strong>{ __( 'Name:' ) }</strong> <TextSkeleton length={ 25 } />
									</p>
									<p>
										<strong>{ __( 'Organization:' ) }</strong> <TextSkeleton length={ 20 } />
									</p>
									<p>
										<strong>{ __( 'Email:' ) }</strong> <TextSkeleton length={ 30 } />
									</p>
								</VStack>
							</div>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</ContactDetailsLayout>
	);
}
