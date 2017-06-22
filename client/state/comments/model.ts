type WPComment
    = { state: 'unknown' }
    | { state: 'loading', siteId: number, commentId: number }
    | { state: 'loaded' } & WPCommentData
    | { state: 'failed', error: string };

type WPCommentAuthor
    = { kind: 'anonymous', avatar?: string, displayName: string, email?: string, url?: string }
    | { kind: 'known', userId: number }

type WPCommentData = {
    author: WPCommentAuthor,
    commentId: number,
    content: string,
    createdAt: Date,
    isLiked: boolean,
    parentId?: number,
    postId: number,
    siteId: number,
    status: WPCommentStatus,
};

type WPCommentStatus = 'approved' | 'pending' | 'spam' | 'trash';
