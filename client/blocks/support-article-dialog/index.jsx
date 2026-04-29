import AsyncLoad from 'calypso/components/async-load';
import { useRouteModal } from 'calypso/lib/route-modal';

const loadDialog = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-support-article-dialog-dialog" */ './dialog'
	);

function SupportArticleDialogLoader() {
	const { isModalOpen } = useRouteModal( 'support-article' );

	if ( ! isModalOpen ) {
		return null;
	}

	return <AsyncLoad require={ loadDialog } placeholder={ null } />;
}

export default SupportArticleDialogLoader;
