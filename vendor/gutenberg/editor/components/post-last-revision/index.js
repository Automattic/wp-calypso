/**
 * WordPress dependencies
 */
import { sprintf, _n } from '@wordpress/i18n';
import { IconButton } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import PostLastRevisionCheck from './check';
import { getWPAdminURL } from '../../utils/url';

function LastRevision( { lastRevisionId, revisionsCount } ) {
	return (
		<PostLastRevisionCheck>
			<IconButton
				href={ getWPAdminURL( 'revision.php', { revision: lastRevisionId, gutenberg: true } ) }
				className="editor-post-last-revision__title"
				icon="backup"
			>
				{
					sprintf(
						_n( '%d Revision', '%d Revisions', revisionsCount ),
						revisionsCount
					)
				}
			</IconButton>
		</PostLastRevisionCheck>
	);
}

export default withSelect(
	( select ) => {
		const {
			getCurrentPostLastRevisionId,
			getCurrentPostRevisionsCount,
		} = select( 'core/editor' );
		return {
			lastRevisionId: getCurrentPostLastRevisionId(),
			revisionsCount: getCurrentPostRevisionsCount(),
		};
	}
)( LastRevision );
