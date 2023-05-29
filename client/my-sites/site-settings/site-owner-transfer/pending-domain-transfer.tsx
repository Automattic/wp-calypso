import { Button } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFooter from 'calypso/components/action-panel/footer';

const PendingDomainTransfer = ( { domain } ) => {
	const translate = useTranslate();
	return (
		<>
			<ActionPanelBody>
				<p>
					{ createInterpolateElement(
						sprintf(
							// translators: %s is the domain name
							translate(
								'There are pending domain transfers for <strong>%s</strong>. Please, complete them before transferring the site.'
							),
							domain.name
						),
						{ strong: <strong /> }
					) }
				</p>
			</ActionPanelBody>
			<ActionPanelFooter>
				<Button primary={ true } href={ `/domains/manage/${ domain.name }` }>
					{ translate( 'Manage domain transfers' ) }
				</Button>
			</ActionPanelFooter>
		</>
	);
};

export default PendingDomainTransfer;
