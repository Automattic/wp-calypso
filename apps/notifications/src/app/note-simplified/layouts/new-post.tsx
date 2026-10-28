import { __experimentalText as Text } from '@wordpress/components';
import Author from '../parts/author';
import Body from '../parts/body';
import Headline from '../parts/headline';
import NoteMeta from '../parts/note-meta';
import SiteIdentity from '../parts/site-identity';
import type { Note } from '../../types';

export default function NewPostNote( { note }: { note: Note } ) {
	const { post, site, actor, actor_count: actorCount } = note.meta ?? {};
	const author = actor?.name && (
		<Author avatar={ actor.avatar }>
			{ actor.url ? (
				<a href={ actor.url } target="_blank" rel="noreferrer">
					{ actor.name }
				</a>
			) : (
				actor.name
			) }
		</Author>
	);

	return (
		<>
			{ post && site ? (
				<SiteIdentity
					site={ site }
					url={ site.url }
					details={ <NoteMeta note={ note }>{ author }</NoteMeta> }
				/>
			) : (
				<Headline note={ note } />
			) }
			{ post && (
				<Text className="wpnc-simplified__quiet-links" size={ 15 } weight={ 600 }>
					<a href={ post.url } target="_blank" rel="noreferrer">
						{ post.title }
					</a>
				</Text>
			) }
			<Body note={ note } hidePeople={ actorCount === 1 } />
		</>
	);
}
