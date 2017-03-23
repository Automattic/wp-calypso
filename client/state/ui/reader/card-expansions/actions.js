/**
 * Internal dependencies
 */
import { READER_EXPAND_CARD, READER_RESET_CARD_EXPANSIONS } from 'state/action-types';
import PostStoreActions from 'lib/feed-post-store/actions';
import * as stats from 'reader/stats';

export const expandCard = ({ postKey, post, site }) => {
    stats.recordTrackForPost('calypso_reader_photo_expanded', post);
    stats.recordTrackForPost('calypso_reader_article_opened', post);

    // Record page view
    PostStoreActions.markSeen(post, site);
    return {
        type: READER_EXPAND_CARD,
        payload: { postKey, post, site },
    };
};

export const resetCardExpansions = () => ({
    type: READER_RESET_CARD_EXPANSIONS,
});
