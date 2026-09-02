import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { fetchParentComment, getParentCommentRef } from './engine';
import NoteActions from './note-actions';
import { BlockText, Timestamp, TitleText } from './rich-text';
import { useInboxVariant } from './variant-context';
import type { Note } from './engine';
import type { ContextRun, NoteBlock, NoteUserRef, NoteView } from './note-model';
import type { ComponentType } from 'react';

/** The parent comment's details for a reply note; idle for anything else. */
export function useParentCommentDetails( note: Note | null ) {
	const parentRef = note ? getParentCommentRef( note ) : null;
	return useQuery( {
		queryKey: [ 'notifications', 'parent-comment', parentRef ],
		queryFn: () => ( parentRef ? fetchParentComment( parentRef ) : null ),
		enabled: !! parentRef,
		staleTime: Infinity,
	} ).data;
}

export function Avatar( {
	user,
	size = 32,
	className,
}: {
	user: NoteUserRef | null;
	size?: number;
	className?: string;
} ) {
	return (
		<span
			className={
				className
					? `dashboard-notifications-inbox__user-row-avatar ${ className }`
					: 'dashboard-notifications-inbox__user-row-avatar'
			}
		>
			{ user?.avatarUrl ? (
				<img src={ user.avatarUrl } alt="" width={ size } height={ size } />
			) : (
				<span aria-hidden="true">{ user?.name.charAt( 0 ).toUpperCase() }</span>
			) }
		</span>
	);
}

export function UserName( { user }: { user: NoteUserRef } ) {
	const name = <Text weight={ 600 }>{ user.name }</Text>;
	return user.url ? (
		<a
			className="dashboard-notifications-inbox__user-row-name"
			href={ user.url }
			target="_blank"
			rel="noreferrer"
		>
			{ name }
		</a>
	) : (
		name
	);
}

/** A person in a list (likers, followers): avatar, name, and their site. */
function UserRow( { user }: { user: NoteUserRef } ) {
	const blog =
		user.homeTitle && user.homeUrl ? (
			<a
				className="dashboard-notifications-inbox__user-row-name"
				href={ user.homeUrl }
				target="_blank"
				rel="noreferrer"
			>
				{ user.homeTitle }
			</a>
		) : (
			user.homeTitle || null
		);

	return (
		<HStack
			className="dashboard-notifications-inbox__user-row"
			spacing={ 3 }
			justify="flex-start"
			alignment="center"
		>
			<Avatar user={ user } />
			<VStack spacing={ 0 }>
				<UserName user={ user } />
				{ blog && <Text variant="muted">{ blog }</Text> }
			</VStack>
		</HStack>
	);
}

export function ContextBlocks( { runs }: { runs: ContextRun[] } ) {
	return (
		<>
			{ runs.map( ( run, index ) =>
				run.kind === 'users' ? (
					<VStack key={ index } spacing={ 0 } className="dashboard-notifications-inbox__user-list">
						{ run.users.map( ( user, userIndex ) => (
							<UserRow key={ userIndex } user={ user } />
						) ) }
					</VStack>
				) : (
					<Text key={ index } variant="muted" className="dashboard-notifications-inbox__block-text">
						<BlockText block={ run.block } />
					</Text>
				)
			) }
		</>
	);
}

export function Postscript( { blocks }: { blocks: NoteBlock[] } ) {
	return (
		<>
			{ blocks.map( ( block, index ) => (
				<Text key={ index } variant="muted" className="dashboard-notifications-inbox__block-text">
					<BlockText block={ block } />
				</Text>
			) ) }
		</>
	);
}

function Message( { block }: { block: NoteBlock } ) {
	return (
		<div className="dashboard-notifications-inbox__body dashboard-notifications-inbox__header-comment">
			<Text className="dashboard-notifications-inbox__block-text">
				<BlockText block={ block } />
			</Text>
		</div>
	);
}

/**
 * Surrounds the comment being acted on: hovering reads as a card and clicking
 * anywhere outside its own controls opens the comment.
 */
export function CommentCard( {
	url,
	children,
}: {
	url: string | null;
	children: React.ReactNode;
} ) {
	const open = ( event: React.MouseEvent< HTMLDivElement > ) => {
		const target = event.target as HTMLElement;
		if ( ! url || target.closest( 'a, button, textarea, input, [role="menu"]' ) ) {
			return;
		}
		if ( window.getSelection()?.toString() ) {
			return;
		}
		window.open( url, '_blank', 'noreferrer' );
	};
	return (
		<div
			className={
				url
					? 'dashboard-notifications-inbox__comment-card is-clickable'
					: 'dashboard-notifications-inbox__comment-card'
			}
			onClick={ open }
			role="presentation"
		>
			{ children }
		</div>
	);
}

/** Avatar column beside a stacked header; every non-achievement layout starts this way. */
function Header( {
	avatarUrl,
	children,
}: {
	avatarUrl: string | null;
	children: React.ReactNode;
} ) {
	return (
		<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
			{ avatarUrl && (
				<img
					className="dashboard-notifications-inbox__note-avatar"
					src={ avatarUrl }
					alt=""
					width={ 32 }
					height={ 32 }
				/>
			) }
			<VStack spacing={ 0 } className="dashboard-notifications-inbox__column">
				{ children }
			</VStack>
		</HStack>
	);
}

export function Body( {
	children,
	isCentered,
}: {
	children: React.ReactNode;
	isCentered?: boolean;
} ) {
	return (
		<VStack
			spacing={ 3 }
			className={
				isCentered
					? 'dashboard-notifications-inbox__body is-achievement'
					: 'dashboard-notifications-inbox__body'
			}
		>
			{ children }
		</VStack>
	);
}

function ThreadView( { view }: { view: Extract< NoteView, { kind: 'thread' } > } ) {
	const { parent, reply, note } = view;
	const parentDetails = useParentCommentDetails( note );
	return (
		<>
			<Header avatarUrl={ parent.avatarUrl ?? note.icon }>
				<VStack spacing={ 1 }>
					<TitleText segments={ parent.author }>
						{ parentDetails?.date && (
							<>
								<Text variant="muted"> · </Text>
								<Timestamp
									timestamp={ parentDetails.date }
									url={ parent.url ?? parentDetails.url }
								/>
							</>
						) }
					</TitleText>
					<Text className="dashboard-notifications-inbox__note-title dashboard-notifications-inbox__body">
						{ parent.excerpt }
						{ parent.url && parent.isTruncated && (
							<>
								{ ' ' }
								<ExternalLink href={ parent.url }>{ __( 'Continue reading' ) }</ExternalLink>
							</>
						) }
					</Text>
				</VStack>
			</Header>
			<Body>
				<div className="dashboard-notifications-inbox__reply">
					<CommentCard url={ view.url }>
						<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
							<Avatar user={ reply.author } />
							<VStack spacing={ 1 } className="dashboard-notifications-inbox__column">
								{ reply.author && (
									<HStack spacing={ 1 } justify="flex-start" alignment="center" expanded={ false }>
										<UserName user={ reply.author } />
										<Text variant="muted">
											{ sprintf(
												/* translators: %s is the name of the person being replied to. */
												__( 'to %s' ),
												reply.replyingTo
											) }
										</Text>
										<Text variant="muted">·</Text>
										<Timestamp timestamp={ view.timestamp } url={ view.url } />
									</HStack>
								) }
								<ContextBlocks runs={ view.context } />
								{ reply.body && (
									<Text className="dashboard-notifications-inbox__block-text">
										<BlockText block={ reply.body } />
									</Text>
								) }
								<NoteActions note={ note } />
							</VStack>
						</HStack>
					</CommentCard>
				</div>
				<Postscript blocks={ view.postscript } />
			</Body>
		</>
	);
}

function CommentView( { view }: { view: Extract< NoteView, { kind: 'comment' } > } ) {
	const hasBody = view.context.length > 0 || view.postscript.length > 0;
	return (
		<>
			<CommentCard url={ view.url }>
				<Header avatarUrl={ view.avatarUrl }>
					<TitleText segments={ view.author }>
						<Text variant="muted"> · </Text>
						<Timestamp timestamp={ view.timestamp } url={ view.url } />
					</TitleText>
					<Message block={ view.body } />
					<NoteActions note={ view.note } />
				</Header>
			</CommentCard>
			{ hasBody && (
				<Body>
					<ContextBlocks runs={ view.context } />
					<Postscript blocks={ view.postscript } />
				</Body>
			) }
		</>
	);
}

function LikeView( { view }: { view: Extract< NoteView, { kind: 'like' } > } ) {
	const hasBody = !! view.excerpt || view.context.length > 0 || view.postscript.length > 0;
	return (
		<>
			<Header avatarUrl={ view.avatarUrl }>
				{ view.liker ? (
					<>
						<UserName user={ view.liker } />
						{ view.snippet && (
							<Text className="dashboard-notifications-inbox__note-title">
								{ view.url ? (
									<a href={ view.url } target="_blank" rel="noreferrer">
										{ view.snippet }
									</a>
								) : (
									view.snippet
								) }
							</Text>
						) }
					</>
				) : (
					<TitleText segments={ view.title } />
				) }
				<Timestamp timestamp={ view.timestamp } url={ view.url } />
				{ view.likedComment && <Message block={ view.likedComment } /> }
			</Header>
			{ hasBody && (
				<Body>
					{ view.excerpt && <Text>{ view.excerpt }</Text> }
					<ContextBlocks runs={ view.context } />
					<Postscript blocks={ view.postscript } />
				</Body>
			) }
			<NoteActions note={ view.note } />
		</>
	);
}

function AchievementView( { view }: { view: Extract< NoteView, { kind: 'achievement' } > } ) {
	return (
		<>
			<Body isCentered>
				{ view.excerpt && <Text>{ view.excerpt }</Text> }
				<ContextBlocks runs={ view.context } />
				<Postscript blocks={ view.postscript } />
			</Body>
			<NoteActions note={ view.note } />
		</>
	);
}

function GenericView( { view }: { view: Extract< NoteView, { kind: 'generic' } > } ) {
	const hasBody = !! view.excerpt || view.context.length > 0 || view.postscript.length > 0;
	return (
		<>
			<Header avatarUrl={ view.avatarUrl }>
				<TitleText segments={ view.title } />
				<Timestamp timestamp={ view.timestamp } url={ view.url } />
			</Header>
			{ hasBody && (
				<Body>
					{ view.excerpt && <Text>{ view.excerpt }</Text> }
					<ContextBlocks runs={ view.context } />
					<Postscript blocks={ view.postscript } />
				</Body>
			) }
			<NoteActions note={ view.note } />
		</>
	);
}

/** Picks the layout for a resolved note view, honouring the active variant. */
export default function NoteViewSwitch( { view }: { view: NoteView } ) {
	const variant = useInboxVariant();
	// The per-kind map loses the kind correlation TS can't follow; each entry
	// was typed against its exact kind at registration.
	const Override = ( variant.detailViews?.[ view.kind ] ?? variant.Detail ) as
		| ComponentType< { view: NoteView } >
		| undefined;
	if ( Override ) {
		return <Override view={ view } />;
	}
	switch ( view.kind ) {
		case 'thread':
			return <ThreadView view={ view } />;
		case 'comment':
			return <CommentView view={ view } />;
		case 'like':
			return <LikeView view={ view } />;
		case 'achievement':
			return <AchievementView view={ view } />;
		case 'generic':
			return <GenericView view={ view } />;
	}
}
