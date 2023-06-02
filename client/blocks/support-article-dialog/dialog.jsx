import { Button, Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteModal } from 'calypso/lib/route-modal';
import { closeSupportArticleDialog } from 'calypso/state/inline-support-article/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInlineSupportArticleActionIsExternal from 'calypso/state/selectors/get-inline-support-article-action-is-external';
import getInlineSupportArticleActionLabel from 'calypso/state/selectors/get-inline-support-article-action-label';
import getInlineSupportArticleActionUrl from 'calypso/state/selectors/get-inline-support-article-action-url';
import getInlineSupportArticleBlogId from 'calypso/state/selectors/get-inline-support-article-blog-id';
import getInlineSupportArticlePostId from 'calypso/state/selectors/get-inline-support-article-post-id';
import DialogContent from './dialog-content';

import './style.scss';
import './content.scss';

const noop = () => {};

export const SupportArticleDialog = () => {
	const translate = useTranslate();
	const { value: supportArticleId, closeModal } = useRouteModal( 'support-article' );
	const actionUrl = useSelector( getInlineSupportArticleActionUrl );
	const actionLabel = useSelector( getInlineSupportArticleActionLabel );
	const actionIsExternal = useSelector( getInlineSupportArticleActionIsExternal );
	const articleUrl = actionUrl ? actionUrl : 'https://support.wordpress.com?p=' + supportArticleId;
	const requestBlogId = useSelector( getInlineSupportArticleBlogId );
	const currentQueryArgs = useSelector( getCurrentQueryArguments );
	let postId = useSelector( getInlineSupportArticlePostId );
	if ( ! postId ) {
		postId = parseInt( currentQueryArgs?.[ 'support-article' ], 10 );
	}

	const dispatch = useDispatch();
	const handleCloseDialog = () => {
		dispatch( closeSupportArticleDialog() );
		closeModal();
	};

	return (
		<Dialog
			isVisible
			additionalClassNames="support-article-dialog"
			baseClassName="support-article-dialog__base dialog"
			buttons={ [
				<Button onClick={ handleCloseDialog }>{ translate( 'Close', { textOnly: true } ) }</Button>,
				<Button
					href={ articleUrl }
					target={ actionIsExternal ? '_blank' : undefined }
					primary
					onClick={ actionIsExternal ? noop : handleCloseDialog }
				>
					{ actionLabel } { actionIsExternal && <Gridicon icon="external" size={ 12 } /> }
				</Button>,
			].filter( Boolean ) }
			onCancel={ handleCloseDialog }
			onClose={ handleCloseDialog }
		>
			<DialogContent postId={ postId } blogId={ requestBlogId } articleUrl={ articleUrl } />
		</Dialog>
	);
};

export default SupportArticleDialog;
