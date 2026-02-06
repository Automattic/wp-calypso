import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainContactVerificationRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

export default function ContactVerificationNotice( { domainName }: { domainName: string } ) {
	return (
		<Notice variant="warning" title={ __( 'Contact verification required' ) }>
			<Text>
				{ __(
					'The registry requires identity verification for this domain. Please submit the required documents to avoid service interruption.'
				) }
			</Text>
			<RouterLinkButton
				variant="link"
				to={ domainContactVerificationRoute.fullPath }
				params={ { domainName } }
			>
				{ __( 'Verify contact information' ) }
			</RouterLinkButton>
		</Notice>
	);
}
