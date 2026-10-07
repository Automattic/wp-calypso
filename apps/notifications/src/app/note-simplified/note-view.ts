import { __, _n, sprintf } from '@wordpress/i18n';
import { zipWithSignature } from '../../panel/templates/functions';
import { splitSubject } from '../note-list/simplified-subject';
import { getHeaderLink } from '../templates/note-summary';
import type { Block, BlockWithSignature, Note, Subject } from '../types';

const MAX_AVATARS = 3;

const TARGET_RANGE_TYPES = [ 'post', 'comment', 'site' ];

type TypeTraits = {
	/** Someone's words are the news. */
	isConversation?: boolean;
	/** The post itself is the news, so its own content is the note, without a card. */
	isPostNews?: boolean;
	/** The note is about a comment the reader wrote. */
	isAboutComment?: boolean;
	/** Heads the list of people who acted, given how many there are. */
	peopleHeading?: ( count: number ) => string;
	/** Names the open note in place of the endpoint's title. */
	title?: string;
	/** The post card only names the post, since what happened is the news. */
	hidesExcerpt?: boolean;
};

const getLikesHeading = ( count: number ) =>
	/* translators: %d: the number of likes */
	sprintf( _n( '%d like', '%d likes', count ), count );

// What each note type means, in one place. Types not listed fall back to the shape of
// their blocks.
const getTypeTraits = ( type: string ): TypeTraits => {
	switch ( type ) {
		case 'comment':
		// A mention inside a post arrives as plain text, with no comment block.
		case 'automattcher':
			return { isConversation: true };
		case 'new_post':
			return { isPostNews: true };
		case 'comment_like':
			return { isAboutComment: true, title: __( 'Likes' ), peopleHeading: getLikesHeading };
		case 'like':
			return { title: __( 'Likes' ), hidesExcerpt: true, peopleHeading: getLikesHeading };
		case 'reblog':
			return { peopleHeading: () => __( 'Reblogs' ) };
		case 'follow':
			return { peopleHeading: () => __( 'Subscribers' ) };
		default:
			return {};
	}
};

export const getNoteTitle = ( note: Note ) => getTypeTraits( note.type ).title ?? note.title;

export type NoteView = {
	/** System notes (orders, achievements, renewals) have no one acting; their body says it all. */
	hasActor: boolean;
	avatars: string[];
	/** What happened, without the thing it happened to when the two can be told apart. */
	sentence: Subject;
	target?: { title: string; url?: string };
	/** A new post's title, which heads its content rather than ending the sentence. */
	postTitle?: { title: string; url: string };
	/** Where it happened, or who is asking while a comment still awaits approval. */
	origin?: string;
	follow?: { siteId: number; isFollowing: boolean };
	/** Oldest first. `parent` is the comment being answered or liked. */
	thread?: {
		parent?: {
			text: string;
			author?: string;
			authorUrl?: string;
			avatar?: string;
			url?: string;
		};
		speaker?: { name?: string; url?: string; avatar?: string };
	};
	post?: {
		title?: string;
		excerpt?: string;
		url: string;
		siteName?: string;
		siteIcon?: string;
		author?: string;
		date?: string;
	};
	card?: { title: string; description?: string; icon?: string; url?: string };
	/** Titles the list of people who acted, which then stands in for the actor row. */
	peopleHeading?: string;
	/** The note's own blocks, minus those the layout above already shows. */
	bodyBlocks: Block[];
};

const getDisplayUrl = ( url?: string, withPath = false ) => {
	try {
		const { hostname, pathname } = new URL( url ?? '' );
		return withPath ? ( hostname + pathname ).replace( /\/$/, '' ) : hostname;
	} catch {
		return undefined;
	}
};

const getRangeText = ( block?: Subject, type?: string ) => {
	const range = block?.ranges?.find( ( candidate ) => candidate.type === type );
	return range ? block?.text.slice( ...range.indices ).trim() : undefined;
};

// An untitled post borrows its opening words as a title, and a reply's subject ends in
// the comment it answers. Either way the title says nothing the comment doesn't.
const isRestating = ( title: string, text?: string ) => {
	const stem = title.split( /…|\.{3}/ )[ 0 ].trim();
	return !! text && ( ! stem || text.startsWith( stem ) );
};

export function getNoteView( note: Note, isPendingApproval = false ): NoteView {
	const blocks: BlockWithSignature[] = zipWithSignature( note.body, note );
	const ofType = ( type: BlockWithSignature[ 'signature' ][ 'type' ] ) =>
		blocks.filter( ( { signature } ) => signature.type === type ).map( ( { block } ) => block );

	const users = ofType( 'user' );
	const [ actor ] = users;
	const [ postBlock ] = ofType( 'post' );
	const hasComment = ofType( 'comment' ).length > 0;
	const { site: siteId, post: postId, parent_comment: parentCommentId } = note.meta?.ids ?? {};
	const [ sentence ] = note.subject;
	const [ header, context ] = note.header ?? [];
	const traits = getTypeTraits( note.type );
	const [ headerRange ] = header?.ranges ?? [];
	const contextText = context?.text?.trim();

	// The comment a reply answers or a like is for. Without details from the endpoint,
	// the header holds it: its author, then its text.
	const isReply = traits.isConversation && !! parentCommentId;
	const getParent = (): NonNullable< NoteView[ 'thread' ] >[ 'parent' ] => {
		if ( ! isReply && ! traits.isAboutComment ) {
			return undefined;
		}
		const details = note.meta?.parent_comment;
		// Blank lines between paragraphs would spend the clamped lines on nothing.
		const text = details?.text?.trim().replace( /\s*\n\s*/g, '\n' ) || contextText;
		if ( ! text ) {
			return undefined;
		}
		return {
			text,
			author: details?.author_name ?? getRangeText( header, 'user' ),
			authorUrl: getHeaderLink( header ),
			avatar: details?.author_avatar ?? header.media?.[ 0 ]?.url,
			url:
				details?.url ??
				( isReply
					? `${ note.url.split( '#' )[ 0 ] }#comment-${ parentCommentId }`
					: context?.ranges?.[ 0 ]?.url ),
		};
	};
	const parent = getParent();

	const hasWords = !! traits.isConversation || hasComment;
	const isConversation = hasWords || !! parent;
	const hasPostCard = ! isConversation && ! traits.isPostNews && !! siteId && !! postId;

	const split = splitSubject( sentence );
	const target = sentence?.ranges?.find(
		( { type, url } ) => url && TARGET_RANGE_TYPES.includes( type )
	);
	const postRange = [ sentence, header ]
		.flatMap( ( block ) => block?.ranges ?? [] )
		.find( ( { type } ) => type === 'post' );

	const getPost = (): NoteView[ 'post' ] => {
		if ( ! hasPostCard && ! isConversation ) {
			return undefined;
		}

		const details = note.meta?.post;
		const noteTitle = hasPostCard
			? split?.title
			: ( getRangeText( sentence, 'post' ) ?? getRangeText( header, 'post' ) );
		// The endpoint's title is the real one; only a title read from the note's own text
		// can turn out to be the start of the comment it answers.
		const title =
			details?.title ||
			( noteTitle && ! isRestating( noteTitle, parent?.text ) ? noteTitle : undefined );
		const excerpt = traits.hidesExcerpt || ! hasPostCard ? undefined : postBlock?.text;

		if ( ! title && ! excerpt ) {
			return undefined;
		}

		return {
			title,
			excerpt,
			url: details?.url ?? ( hasPostCard ? undefined : postRange?.url ) ?? note.url,
			siteName: note.meta?.site?.name,
			siteIcon: note.meta?.site?.icon,
			author: details?.author_name,
			date: details?.date ?? undefined,
		};
	};
	const post = getPost();

	// Without a post, the header is the next best description of the thing. When it opens
	// with a person, the thing is its second line; otherwise it is the header itself, such
	// as a site and its tagline.
	const getCard = (): NoteView[ 'card' ] => {
		if ( isConversation || hasPostCard || traits.isPostNews || ! header?.text ) {
			return undefined;
		}
		if ( headerRange?.type !== 'user' || headerRange.id === headerRange.site_id ) {
			return {
				title: header.text,
				description: contextText,
				icon: header.media?.[ 0 ]?.url,
				url: headerRange?.url,
			};
		}
		return contextText
			? { title: contextText, url: context.ranges?.[ 0 ]?.url ?? note.url }
			: undefined;
	};
	const card = getCard();
	const hasCard = hasPostCard || !! card;

	// Beneath a card or a comment, the list of people already says who acted.
	const peopleHeading =
		users.length > 0 && ! hasWords && ( hasCard || !! parent )
			? ( traits.peopleHeading?.( users.length ) ?? note.title )
			: undefined;
	// A lone person is named by the actor row or the thread, so their block isn't repeated.
	const isActorShown = users.length === 1 && ! peopleHeading;

	const getOrigin = () => {
		if ( isPendingApproval ) {
			return getDisplayUrl( actor?.meta?.links?.home, true );
		}
		// A card names its own site, and so may the sentence.
		const isSiteNamed = sentence.ranges?.some( ( { type } ) => type === 'site' );
		if ( post || hasCard || isSiteNamed ) {
			return undefined;
		}
		return getDisplayUrl( target?.url );
	};

	const groupAvatars = users
		.map( ( { media } ) => media?.[ 0 ]?.url )
		.filter( ( url ): url is string => !! url )
		.slice( 0, MAX_AVATARS );
	const action = split?.action ?? sentence;
	const followSiteId = actor?.meta?.ids?.site;
	const newPostTitle = traits.isPostNews ? note.meta?.post?.title || split?.title : undefined;

	return {
		hasActor: users.length > 0 || !! header,
		avatars: groupAvatars.length > 1 ? groupAvatars : [ note.icon ],
		sentence: {
			...action,
			// Reply notes lead with an inline icon that only makes sense in the list.
			ranges: action?.ranges?.filter( ( { type } ) => type !== 'noticon' ),
		},
		target:
			split && ! hasCard && ! isConversation && ! traits.isPostNews
				? { title: split.title, url: target?.url }
				: undefined,
		postTitle: newPostTitle
			? { title: newPostTitle, url: note.meta?.post?.url ?? note.url }
			: undefined,
		origin: getOrigin(),
		follow:
			isActorShown && ! hasComment && followSiteId && actor.actions && 'follow' in actor.actions
				? { siteId: followSiteId, isFollowing: !! actor.actions.follow }
				: undefined,
		thread: isConversation
			? {
					parent,
					speaker: hasWords
						? {
								name: actor?.text ?? getRangeText( sentence, 'user' ),
								url: actor?.meta?.ids?.user
									? `https://wordpress.com/reader/users/id/${ actor.meta.ids.user }`
									: ( actor?.meta?.links?.home ?? getHeaderLink( sentence ) ),
								avatar: actor?.media?.[ 0 ]?.url ?? note.icon,
							}
						: undefined,
				}
			: undefined,
		post,
		card,
		peopleHeading,
		bodyBlocks: blocks
			.filter(
				( { signature } ) =>
					! ( ( hasComment || isActorShown ) && signature.type === 'user' ) &&
					// Only a card that was built may stand in for the post it describes.
					! ( hasPostCard && !! post && signature.type === 'post' )
			)
			.map( ( { block } ) => block ),
	};
}
