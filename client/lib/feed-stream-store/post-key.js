export function keyForPost(post) {
    if (post.feed_ID && post.feed_item_ID) {
        return {
            feedId: post.feed_ID,
            postId: post.feed_item_ID,
        };
    }
    if (post.is_external) {
        return {
            feedId: post.feed_ID,
            postId: post.ID,
        };
    }
    return {
        blogId: post.site_ID,
        postId: post.ID,
    };
}

export function keysAreEqual(a, b) {
    if (a === b) {
        return true;
    }
    if ((!a && b) || (a && !b)) {
        return false;
    }
    if ((a.isGap && !b.isGap) || (!a.isGap && b.isGap)) {
        return false;
    }
    if (a.isGap && b.isGap) {
        return a.from === b.from && a.to === b.to;
    }
    if (a.postId !== b.postId) {
        return false;
    }
    if (a.feedId) {
        return a.feedId === b.feedId;
    }
    return a.blogId === b.blogId;
}

// TODO add support for CombinedCard postKeys + Recs etc.
export function keyToString(postKey) {
    if (
        !postKey ||
        postKey.isRecommendationBlock ||
        postKey.isGap ||
        postKey.isRecommendation ||
        postKey.isCombination
    ) {
        return null;
    }

    const feedId = postKey.feedId ? `&feedId=${postKey.feedId}` : '';
    const blogId = postKey.blogId ? `&feedId=${postKey.blogId}` : '';
    return `postId=${postKey.postId}${feedId}${blogId} `;
}
