import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFooter from 'calypso/components/action-panel/footer';
import { ResponseDomain } from 'calypso/lib/domains/types';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const PendingDomainTransfer = ( { domain }: { domain: ResponseDomain } ) => {
	const translate = useTranslate();
	return (
		<>
			<ActionPanelBody>
				<p>
					{ createInterpolateElement(
						sprintf(
							// translators: %s is the domain name
							translate(
								'There are pending domain transfers for <strong>%s</strong>. Please complete them before transferring the site.'
							),
							domain.name
						),
						{ strong: <Strong /> }
					) }
				</p>
			</ActionPanelBody>
			<ActionPanelFooter>
				<Button primary href={ `/domains/manage/${ domain.name }` }>
					{ translate( 'Manage domain transfers' ) }
				</Button>
			</ActionPanelFooter>
		</>
	);
};

export default PendingDomainTransfer;
