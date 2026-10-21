import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type ReaderInterestTag = {
	title: string;
	slug: string;
};

type ReaderInterestsResponse = {
	interests: ReaderInterestTag[];
};

export type ReaderInterestTopic = {
	name: string;
	tag: string;
};

type ReaderInterestTagOptions = {
	enabled?: boolean;
};

export function useReaderInterestTags( options?: ReaderInterestTagOptions ): ReaderInterestTopic[] {
	const locale = useLocale();

	const { data: interestTopics = [] } = useQuery<
		ReaderInterestsResponse,
		unknown,
		ReaderInterestTopic[]
	>( {
		queryKey: [ 'read/interests', locale ],
		enabled: options?.enabled ?? true,
		queryFn: () =>
			wpcom.req.get( { path: '/read/interests', apiNamespace: 'wpcom/v2' }, { _locale: locale } ),
		select: ( data ) =>
			data.interests.map( ( interest ) => ( { name: interest.title, tag: interest.slug } ) ),
	} );

	return interestTopics;
}
