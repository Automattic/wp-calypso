import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface TagResult {
	count: number;
	tag: Tag;
}
interface Tag {
	slug: string;
	title: string;
}

export default function TrendingTags() {
	const query = {
		apiVersion: '1.2',
		staleTime: Infinity,
	};
	const tagsResponse = useQuery( [ 'trending-tags' ], () =>
		wpcom.req.get( `/read/trending/tags`, query )
	);

	return (
		<div>
			{ tagsResponse.status === 'success' &&
				tagsResponse.data?.tags?.map( ( tag: TagResult ) => (
					<div key={ tag.tag.slug }>
						{ /* TODO add link to tag page */ }
						<span className="trending-tags__title">{ tag.tag.title }</span>
						{ /* TODO: abreviate count */ }
						<span className="trending-tags__count">{ tag.count }</span>
					</div>
				) ) }
		</div>
	);
}
