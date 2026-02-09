import { extractTld, getContactVerificationTldConfig } from '@automattic/api-core';
import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { domainContactVerificationRoute } from '../../app/router/domains';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';

export default function ContactVerificationNotice( { domainName }: { domainName: string } ) {
	const tld = extractTld( domainName );
	const tldConfig = getContactVerificationTldConfig( tld );

	return (
		<Notice variant="warning" title={ __( 'Contact verification required' ) }>
			<VStack spacing={ 4 }>
				<Text>{ tldConfig.registryDescription }</Text>
				<RouterLinkButton
					variant="link"
					to={ domainContactVerificationRoute.fullPath }
					params={ { domainName } }
				>
					{ __( 'Verify your contact information' ) }
				</RouterLinkButton>
			</VStack>
		</Notice>
	);
}
