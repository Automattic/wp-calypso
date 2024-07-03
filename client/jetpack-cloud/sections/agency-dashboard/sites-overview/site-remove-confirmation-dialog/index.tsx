import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { SiteNode } from '../types';

import './style.scss';

type Props = {
	site: SiteNode;
	onClose: () => void;
};

export function SiteRemoveConfirmationDialog( { site, onClose }: Props ) {
	const translate = useTranslate();

	const title = translate( 'Remove site' );
	return (
		<Dialog
			label={ title }
			isVisible
			additionalClassNames="site-remove-confirmation-dialog"
			onClose={ onClose }
			buttons={ [
				<Button key="cancel-button" onClick={ onClose }>
					{ translate( 'Cancel' ) }
				</Button>,

				<Button key="remove-site-button" primary scary>
					{ translate( 'Remove site' ) }
				</Button>,
			] }
		>
			<h2 className="site-remove-confirmation-dialog__heading">{ title }</h2>

			{ translate( 'Are you sure you want to remove the site {{b}}%(siteName)s{{/b}}?', {
				args: { siteName: site.value?.url },
				components: {
					b: <b />,
				},
				comment: '%(siteName)s is the site name',
			} ) }
		</Dialog>
	);
}
