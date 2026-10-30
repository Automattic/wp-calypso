import { isEnabled } from '@automattic/calypso-config';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import RouterLinkButton from '../../components/router-link-button';
import { SectionHeader } from '../../components/section-header';

export default function LegacyContact() {
	const { supports } = useAppContext();

	if ( ! supports.me || ! supports.me.security || ! isEnabled( 'me/legacy-contact' ) ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SectionHeader
						title={ __( 'Legacy contact' ) }
						description={ __(
							'Choose someone to look after your sites when you pass away. Legacy contact is now set on your WordPress.com account and applies to all of your sites.'
						) }
						level={ 3 }
					/>
					<ButtonStack justify="flex-start">
						<RouterLinkButton variant="secondary" to="/me/security/legacy-contact">
							{ __( 'Manage your legacy contact' ) }
						</RouterLinkButton>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
