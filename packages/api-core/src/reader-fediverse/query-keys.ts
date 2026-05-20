import type { NotificationsFilter } from '../reader-social/notifications-filter';

export const readerFediverseKeys = {
	all: [ 'reader', 'fediverse' ] as const,
	connections: () => [ ...readerFediverseKeys.all, 'connections' ] as const,
	connection: ( id: number | null ) => [ ...readerFediverseKeys.all, 'connection', id ] as const,
	timeline: ( connectionId: number ) =>
		[ ...readerFediverseKeys.all, 'timeline', connectionId ] as const,
	notifications: ( connectionId: number, filter: NotificationsFilter ) =>
		[ ...readerFediverseKeys.all, 'notifications', connectionId, filter ] as const,
	authorProfile: ( connectionId: number, actor: string ) =>
		[ ...readerFediverseKeys.all, 'profile', connectionId, actor ] as const,
	authorFeed: ( connectionId: number, actor: string ) =>
		[ ...readerFediverseKeys.all, 'profile-feed', connectionId, actor ] as const,
	actorFollowers: ( connectionId: number, actor: string ) =>
		[ ...readerFediverseKeys.all, 'actor-followers', connectionId, actor ] as const,
	actorFollowing: ( connectionId: number, actor: string ) =>
		[ ...readerFediverseKeys.all, 'actor-following', connectionId, actor ] as const,
};
