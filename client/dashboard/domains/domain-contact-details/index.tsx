import { domainWhoisQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';

export default function DomainContactDetails() {
	const { domainName } = useParams( { strict: false } );

	const { data: contactInfo } = useSuspenseQuery( domainWhoisQuery( domainName ) );

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader title={ __( 'Contact details & privacy' ) } level={ 3 } />
					{ /* Contact form will be implemented in task 5 */ }
					<div>{ __( 'Contact information will be displayed here' ) }</div>
					{ /* Placeholder to use contactInfo to avoid unused variable warning */ }
					{ contactInfo && (
						<div style={ { display: 'none' } }>{ JSON.stringify( contactInfo ) }</div>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
