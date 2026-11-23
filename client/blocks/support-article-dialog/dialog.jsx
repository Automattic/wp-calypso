import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRouteModal } from 'calypso/lib/route-modal';
import DialogContent from './dialog-content';

import './style.scss';
import './content.scss';

export const SupportArticleDialog = () => {
	const translate = useTranslate();
	const { value: supportArticleId, closeModal } = useRouteModal( 'support-article' );
	const articleUrl = 'https://support.wordpress.com?p=' + supportArticleId;
	const postId = parseInt( supportArticleId, 10 );

	return (
		<Dialog
			isVisible
			additionalClassNames="support-article-dialog"
			baseClassName="support-article-dialog__base dialog"
			buttons={ [
				<Button key="close" onClick={ closeModal }>
					{ translate( 'Close', { textOnly: true } ) }
				</Button>,
				<Button key="visit" href={ articleUrl } target="_blank" primary>
					{ translate( 'Visit article' ) } <Gridicon icon="external" size={ 12 } />
				</Button>,
			] }
			onCancel={ closeModal }
			onClose={ closeModal }
		>
			<DialogContent postId={ postId } />
		</Dialog>
	);
};

export default SupportArticleDialog;
