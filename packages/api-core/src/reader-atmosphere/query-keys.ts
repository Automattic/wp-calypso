import type { AtmosphereAuthorFeedFilter } from './types';

export const readerAtmosphereKeys = {
	all: [ 'reader', 'atmosphere' ] as const,
	connections: () => [ ...readerAtmosphereKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerAtmosphereKeys.all, 'connection', id ] as const,
	timeline: ( connectionId: number ) =>
		[ ...readerAtmosphereKeys.all, 'timeline', connectionId ] as const,
	thread: ( uri: string ) => [ ...readerAtmosphereKeys.all, 'thread', uri ] as const,
	profile: ( actor: string ) => [ ...readerAtmosphereKeys.all, 'profile', actor ] as const,
	scopedProfile: ( connectionId: number, actor: string ) =>
		[ ...readerAtmosphereKeys.all, 'scoped-profile', connectionId, actor ] as const,
	authorFeed: ( actor: string, filter?: AtmosphereAuthorFeedFilter ) =>
		filter
			? ( [ ...readerAtmosphereKeys.all, 'author-feed', actor, filter ] as const )
			: ( [ ...readerAtmosphereKeys.all, 'author-feed', actor ] as const ),
	tagFeed: ( connectionId: number, hashtag: string ) =>
		[ ...readerAtmosphereKeys.all, 'tag-feed', connectionId, hashtag ] as const,
};
