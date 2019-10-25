// With a _real_ TypeScript compiler, we could use const enums.
/* const */ enum ActionType {
	SET_SITE_TITLE,
	SET_SITE_TYPE,
}
export { ActionType };

export enum SiteType {
	BLOG = 'blog',
	STORE = 'store',
	STORY = 'story',
}
