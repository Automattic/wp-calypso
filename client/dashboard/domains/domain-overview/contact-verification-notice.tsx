import { __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainContactVerificationRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

export default function ContactVerificationNotice( { domainName }: { domainName: string } ) {
	return (
		<Notice variant="warning" title={ __( 'Additional contact verification required' ) }>
			<Text>
				{ createInterpolateElement(
					__(
						'The registry requires identity verification for this domain. Please submit the required documents to avoid service interruption. <a/>'
					),
					{
						a: (
							<RouterLinkButton
								variant="link"
								to={ domainContactVerificationRoute.fullPath }
								params={ { domainName } }
							>
								{ __( 'Verify contact information' ) }
							</RouterLinkButton>
						),
					}
				) }
			</Text>
		</Notice>
	);
}
