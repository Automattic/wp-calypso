import AsyncLoad from 'calypso/components/async-load';
import { useRouteModal } from 'calypso/lib/route-modal';

function SupportArticleDialogLoader() {
	const { isModalOpen } = useRouteModal( 'support-article' );

	if ( ! isModalOpen ) {
		return null;
	}

	return <AsyncLoad require="calypso/blocks/support-article-dialog/dialog" placeholder={ null } />;
}

export default SupportArticleDialogLoader;
