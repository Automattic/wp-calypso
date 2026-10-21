import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { PanelCardHeading } from 'calypso/components/panel';
import { ResponseDomain } from 'calypso/lib/domains/types';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const PendingDomainTransfer = ( { domain }: { domain: ResponseDomain } ) => {
	const translate = useTranslate();
	return (
		<>
			<>
				<PanelCardHeading>{ translate( 'Pending domain transfers' ) }</PanelCardHeading>
				<p>
					{ translate(
						'There are pending domain transfers for {{strong}}%(domainName)s{{/strong}}. Please complete them before transferring the site.',
						{
							args: { domainName: domain.name },
							components: { strong: <Strong /> },
							comment: '%(domainName)s is the domain name',
						}
					) }
				</p>
			</>
			<>
				<Button primary href={ `/domains/manage/${ domain.name }` }>
					{ translate( 'Manage domain transfers' ) }
				</Button>
			</>
		</>
	);
};

export default PendingDomainTransfer;
