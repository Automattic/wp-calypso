import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	ExternalLink,
	Notice,
	TextareaControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { UndoBar, getActionIcon } from './note-actions';
import { DetailFrame, DetailLoading, useDetailNote } from './note-detail';
import { getTitleSegments } from './note-model';
import { Avatar, Body, ContextBlocks, Postscript, UserName } from './note-views';
import { BlockText, Timestamp, TitleText } from './rich-text';
import { useNoteActions } from './use-note-actions';
import type { Note } from './engine';
import type { NoteView } from './note-model';
import type { DetailPaneSlotProps } from './variants';

/* The pre-P2 detail: content full width, comments quoted, and every action in
   a footer bar with an always-open reply box — the panel's shape. */

function ClassicActions( { note }: { note: Note } ) {
	const state = useNoteActions( note );
	const buttons = [
		...state.items.filter( ( item ) => item.key !== 'reply' ),
		...state.menuItems,
	].map( ( item ) => {
		if ( item.key === 'spam' ) {
			return { ...item, label: __( 'Spam' ) };
		}
		if ( item.key === 'trash' ) {
			return { ...item, label: __( 'Trash' ) };
		}
		return item;
	} );
	const canReply = state.items.some( ( item ) => item.key === 'reply' );

	const submitOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' && ( event.metaKey || event.ctrlKey ) ) {
			event.preventDefault();
			state.reply.submit();
		}
	};

	if ( buttons.length === 0 && ! canReply && ! state.pendingUndoable ) {
		return null;
	}

	return (
		<VStack spacing={ 3 } className="dashboard-notifications-inbox__classic-actions">
			<UndoBar state={ state } />
			{ buttons.length > 0 && (
				<HStack justify="flex-start" spacing={ 1 } wrap>
					{ buttons.map( ( item ) => (
						<Button
							key={ item.key }
							variant="secondary"
							icon={ getActionIcon( item ) }
							isPressed={ item.isPressed }
							isDestructive={ item.key === 'spam' || item.key === 'trash' }
							href={ item.href }
							target={ item.href ? '_blank' : undefined }
							rel={ item.href ? 'noreferrer' : undefined }
							onClick={ item.onClick }
						>
							{ item.label }
						</Button>
					) ) }
				</HStack>
			) }
			{ state.error && (
				<Notice status="error" isDismissible onRemove={ state.clearError }>
					{ state.error }
				</Notice>
			) }
			{ state.mode === 'edit' && (
				<VStack spacing={ 2 }>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Edit comment' ) }
						hideLabelFromVision
						value={ state.edit.text }
						onChange={ state.edit.setText }
						rows={ 4 }
						disabled={ state.isSubmitting }
					/>
					<HStack justify="flex-start" spacing={ 2 }>
						<Button
							variant="primary"
							isBusy={ state.isSubmitting }
							disabled={ state.isSubmitting || ! state.edit.text.trim() }
							onClick={ state.edit.submit }
						>
							{ __( 'Save' ) }
						</Button>
						<Button variant="tertiary" disabled={ state.isSubmitting } onClick={ state.close }>
							{ __( 'Cancel' ) }
						</Button>
					</HStack>
				</VStack>
			) }
			{ canReply && (
				<VStack spacing={ 2 } className="dashboard-notifications-inbox__reply-box">
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Reply' ) }
						hideLabelFromVision
						placeholder={ state.reply.placeholder }
						value={ state.reply.text }
						onChange={ state.reply.setText }
						onKeyDown={ submitOnEnter }
						rows={ 3 }
						disabled={ state.isSubmitting }
					/>
					<HStack justify="flex-end" spacing={ 2 }>
						<Button
							variant="primary"
							isBusy={ state.isSubmitting }
							disabled={ state.isSubmitting || ! state.reply.text.trim() }
							onClick={ state.reply.submit }
						>
							{ __( 'Send' ) }
						</Button>
					</HStack>
				</VStack>
			) }
		</VStack>
	);
}

function ClassicHeader( { view }: { view: NoteView } ) {
	const { note } = view;
	if ( view.kind === 'thread' ) {
		const { parent } = view;
		return (
			<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
				{ ( parent.avatarUrl ?? note.icon ) && (
					<img
						className="dashboard-notifications-inbox__note-avatar"
						src={ parent.avatarUrl ?? note.icon }
						alt=""
						width={ 32 }
						height={ 32 }
					/>
				) }
				<VStack spacing={ 1 } className="dashboard-notifications-inbox__column">
					<Text className="dashboard-notifications-inbox__note-title">
						{ createInterpolateElement(
							/* translators: <author/> is the parent comment's author; <post/> is the post title. */
							__( '<author /> on <post />' ),
							{
								author: <TitleText segments={ parent.author } />,
								post: parent.postLink?.url ? (
									<a href={ parent.postLink.url } target="_blank" rel="noreferrer">
										{ parent.postLink.text }
									</a>
								) : (
									<span>{ parent.postLink?.text }</span>
								),
							}
						) }
					</Text>
					<Text variant="muted">
						{ parent.excerpt }
						{ parent.url && (
							<>
								{ ' ' }
								<ExternalLink href={ parent.url }>{ __( 'Open' ) }</ExternalLink>
							</>
						) }
					</Text>
				</VStack>
			</HStack>
		);
	}
	if ( view.kind === 'achievement' ) {
		return null;
	}
	return (
		<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
			<img
				className="dashboard-notifications-inbox__note-avatar"
				src={ view.avatarUrl }
				alt=""
				width={ 32 }
				height={ 32 }
			/>
			<VStack spacing={ 0 } className="dashboard-notifications-inbox__column">
				<TitleText segments={ getTitleSegments( view.note ) } />
				<Timestamp timestamp={ view.timestamp } url={ view.url } />
			</VStack>
		</HStack>
	);
}

function ClassicBody( { view }: { view: NoteView } ) {
	const quote = ( block: React.ComponentProps< typeof BlockText >[ 'block' ] ) => (
		<blockquote>
			<Text as="p">
				<BlockText block={ block } />
			</Text>
		</blockquote>
	);

	return (
		<Body isCentered={ view.kind === 'achievement' }>
			{ view.kind === 'thread' && (
				<div className="dashboard-notifications-inbox__classic-response">
					<VStack spacing={ 3 }>
						<HStack spacing={ 3 } justify="flex-start" alignment="center">
							<Avatar user={ view.reply.author } />
							<VStack spacing={ 0 }>
								{ view.reply.author && <UserName user={ view.reply.author } /> }
								<Text variant="muted">
									<Timestamp timestamp={ view.timestamp } url={ view.url } />
									{ view.reply.author?.homeTitle && view.reply.author.homeUrl && (
										<>
											{ ' · ' }
											<a
												className="dashboard-notifications-inbox__user-row-name"
												href={ view.reply.author.homeUrl }
												target="_blank"
												rel="noreferrer"
											>
												{ view.reply.author.homeTitle }
											</a>
										</>
									) }
								</Text>
							</VStack>
						</HStack>
						{ view.reply.body && (
							<Text className="dashboard-notifications-inbox__block-text">
								<BlockText block={ view.reply.body } />
							</Text>
						) }
					</VStack>
				</div>
			) }
			{ view.kind === 'comment' && quote( view.body ) }
			{ view.kind === 'like' && view.likedComment && quote( view.likedComment ) }
			{ 'excerpt' in view && view.excerpt && <Text>{ view.excerpt }</Text> }
			<ContextBlocks runs={ view.context } />
			<Postscript blocks={ view.postscript } />
		</Body>
	);
}

// The pane's title is just what the note is: Reply, Mention, 2 Likes.
function getClassicTitle( view: NoteView ): string {
	if ( view.kind === 'thread' ) {
		return __( 'Reply' );
	}
	if ( view.kind === 'like' ) {
		const likers = view.context.reduce(
			( count, run ) => ( run.kind === 'users' ? count + run.users.length : count ),
			0
		);
		if ( likers > 0 ) {
			/* translators: %d: number of likes on the post or comment. */
			return sprintf( _n( '%d Like', '%d Likes', likers ), likers );
		}
	}
	return view.typeLabel;
}

/** The Classic detail: title, header, full-width body, and a footer action bar. */
function ClassicDetail( { view }: { view: NoteView } ) {
	return (
		<>
			<Text className="dashboard-notifications-inbox__classic-title" size={ 18 } weight={ 600 }>
				{ getClassicTitle( view ) }
			</Text>
			<div className="dashboard-notifications-inbox__classic-header">
				<ClassicHeader view={ view } />
			</div>
			<ClassicBody view={ view } />
			<div className="dashboard-notifications-inbox__classic-footer">
				<ClassicActions note={ view.note } />
			</div>
		</>
	);
}

/** The whole Classic pane: the card without the type-and-navigation header. */
export default function ClassicDetailPane( { noteId, onClose }: DetailPaneSlotProps ) {
	const { note, view, timedOut } = useDetailNote( noteId );
	return (
		<DetailFrame onClose={ onClose }>
			{ ! note || ! view ? (
				<DetailLoading timedOut={ timedOut } />
			) : (
				<ClassicDetail view={ view } />
			) }
		</DetailFrame>
	);
}
