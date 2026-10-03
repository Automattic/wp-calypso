import { zipWithSignature } from '../../panel/templates/functions';
import { splitSubject } from '../note-list/simplified-subject';
import { getHeaderLink } from '../templates/note-summary';
import type { BlockWithSignature, Note, Subject } from '../types';

const MAX_AVATARS = 3;

// A mention inside a post arrives as plain text, with no comment block to recognise it by.
const POST_MENTION_TYPE = 'automattcher';

// Sent only to subscribers of the site the post was published on.
const NEW_POST_TYPE = 'new_post';

const TARGET_RANGE_TYPES = [ 'post', 'comment', 'site' ];

export type NoteView = {
	avatars: string[];
	/** What happened, without the thing it happened to when the two can be told apart. */
	sentence: Subject;
	target?: { title: string; url?: string };
	/** Where it happened, or who is asking while a comment still awaits approval. */
	origin?: string;
	isFromSubscription: boolean;
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
		/** The post is the news itself, not the setting for something else. */
		isFeatured: boolean;
		image?: string;
		siteName?: string;
		siteIcon?: string;
		author?: string;
		date?: string;
	};
	card?: { title: string; description?: string; icon?: string; url?: string };
	/** Titles the list of people who acted, which then stands in for the actor row. */
	peopleHeading?: string;
	isBlockHidden: ( block: BlockWithSignature ) => boolean;
};

const toPlainText = ( markup?: string ) =>
	markup
		? new DOMParser().parseFromString( markup, 'text/html' ).body.textContent?.trim()
		: undefined;

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
	const [ headerRange ] = header?.ranges ?? [];
	const contextText = context?.text?.trim();

	// On a reply or a comment like, the header is the comment answered or liked: its
	// author, then its text. Everywhere else its second line is the post title.
	const isReply = note.type === 'comment' && !! parentCommentId;
	const parent =
		contextText && ( isReply || note.type === 'comment_like' )
			? {
					text: contextText,
					author: getRangeText( header, 'user' ),
					authorUrl: getHeaderLink( header ),
					avatar: header.media?.[ 0 ]?.url,
					url: isReply
						? `${ note.url.split( '#' )[ 0 ] }#comment-${ parentCommentId }`
						: context.ranges?.[ 0 ]?.url,
				}
			: undefined;

	const hasWords = hasComment || note.type === POST_MENTION_TYPE;
	const isConversation = hasWords || !! parent;
	const hasPostCard = ! isConversation && !! siteId && !! postId;

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

		const details = note.post;
		const noteTitle = hasPostCard
			? split?.title
			: ( getRangeText( sentence, 'post' ) ?? getRangeText( header, 'post' ) );
		const title = [ toPlainText( details?.title ), noteTitle ].find(
			( candidate ) => candidate && ! isRestating( candidate, parent?.text )
		);
		const excerpt =
			toPlainText( details?.excerpt ) || ( hasPostCard ? postBlock?.text : undefined );

		if ( ! title && ! excerpt ) {
			return undefined;
		}

		return {
			title,
			excerpt,
			url: details?.url ?? ( hasPostCard ? undefined : postRange?.url ) ?? note.url,
			isFeatured: hasPostCard && !! postBlock,
			image: details?.featured_image,
			siteName: toPlainText( details?.site_name ),
			siteIcon: details?.site_icon,
			author: details?.author_name,
			date: details?.date,
		};
	};
	const post = getPost();

	// Without a post, the header is the next best description of the thing. When it opens
	// with a person, the thing is its second line; otherwise it is the header itself, such
	// as a site and its tagline.
	const getCard = (): NoteView[ 'card' ] => {
		if ( isConversation || hasPostCard || ! header?.text ) {
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
		users.length > 0 && ! hasWords && ( hasCard || !! parent ) ? note.title : undefined;
	// A lone person is named by the actor row or the thread, so their block isn't repeated.
	const isActorShown = users.length === 1 && ! peopleHeading;

	const getOrigin = () => {
		if ( isPendingApproval ) {
			return getDisplayUrl( actor?.meta?.links?.home, true );
		}
		// A card that isn't the news names its own site.
		if ( post && ! post.isFeatured ) {
			return undefined;
		}
		const isSiteNamed =
			sentence.ranges?.some( ( { type } ) => type === 'site' ) ||
			( !! post?.siteName && sentence.text.includes( post.siteName ) );
		if ( isSiteNamed ) {
			return undefined;
		}
		if ( post?.siteName ) {
			return post.siteName;
		}
		return hasCard ? undefined : getDisplayUrl( target?.url );
	};

	const groupAvatars = users
		.map( ( { media } ) => media?.[ 0 ]?.url )
		.filter( ( url ): url is string => !! url )
		.slice( 0, MAX_AVATARS );
	const action = split?.action ?? sentence;
	const followSiteId = actor?.meta?.ids?.site;

	return {
		avatars: groupAvatars.length > 1 ? groupAvatars : [ note.icon ],
		sentence: {
			...action,
			// Reply notes lead with an inline icon that only makes sense in the list.
			ranges: action?.ranges?.filter( ( { type } ) => type !== 'noticon' ),
		},
		target:
			split && ! hasCard && ! isConversation ? { title: split.title, url: target?.url } : undefined,
		origin: getOrigin(),
		isFromSubscription: note.type === NEW_POST_TYPE,
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
		isBlockHidden: ( { signature } ) =>
			( ( hasComment || isActorShown ) && signature.type === 'user' ) ||
			// Only a card that was built may stand in for the post it describes.
			( hasPostCard && !! post && signature.type === 'post' ),
	};
}
