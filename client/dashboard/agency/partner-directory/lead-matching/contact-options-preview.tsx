import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import ContactOptionsFields from './contact-options-fields';

export default function ContactOptionsPreview( { countryCode }: { countryCode?: string } ) {
	return (
		<Card className="agency-lead-matching-contact-options">
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 3 }
						title={ __( 'Contact options' ) }
						description={ __(
							'We add these to the email that introduces you to a matched client, so they can call you or book a time right away.'
						) }
					/>
					<ContactOptionsFields countryCode={ countryCode } />
				</VStack>
			</CardBody>
		</Card>
	);
}
