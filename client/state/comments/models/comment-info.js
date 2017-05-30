export function CommentInfo( {
	actions = null,
	content = '',
	createdAt = Date.now(),
	isLiked = false,
	parentId = 0,
	status = null,
} ) {
	this.actions = actions;
	this.content = content;
	this.createdAt = createdAt;
	this.isLiked = isLiked;
	this.parentId = parentId;
	this.status = status;
}
