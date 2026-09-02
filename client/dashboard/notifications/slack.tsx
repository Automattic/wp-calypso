import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	DropdownMenu,
	ExternalLink,
	MenuGroup,
	MenuItem,
	Notice,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { EditBox, ReplyBox, UndoBar, getActionIcon } from './note-actions';
import { Avatar, CommentCard, Postscript, UserName, useParentCommentDetails } from './note-views';
import { BlockText, Timestamp, TitleText } from './rich-text';
import { useNoteActions } from './use-note-actions';
import type { NoteView } from './note-model';
import type { NoteActionsState } from './use-note-actions';

/* Slack's message toolbar: icon-only, floating at the message's top right,
   shown while the message is hovered or holds focus. */
function SlackToolbar( { state }: { state: NoteActionsState } ) {
	if ( state.items.length === 0 && state.menuItems.length === 0 ) {
		return null;
	}
	return (
		<HStack
			spacing={ 1 }
			expanded={ false }
			className="dashboard-notifications-inbox__slack-toolbar"
		>
			{ state.items.map( ( item ) => (
				<Button
					key={ item.key }
					size="small"
					icon={ getActionIcon( item ) }
					label={ item.label }
					isPressed={ item.isPressed }
					href={ item.href }
					target={ item.href ? '_blank' : undefined }
					rel={ item.href ? 'noreferrer' : undefined }
					onClick={ item.onClick }
				/>
			) ) }
			{ state.menuItems.length > 0 && (
				<DropdownMenu
					icon={ moreVertical }
					label={ __( 'More actions' ) }
					toggleProps={ { size: 'small' } }
				>
					{ ( { onClose } ) => (
						<MenuGroup>
							{ state.menuItems.map( ( item ) => (
								<MenuItem
									key={ item.key }
									icon={ getActionIcon( item ) }
									onClick={ () => {
										onClose();
										item.onClick?.();
									} }
								>
									{ item.label }
								</MenuItem>
							) ) }
						</MenuGroup>
					) }
				</DropdownMenu>
			) }
		</HStack>
	);
}

/** A mention or plain comment, Slack-shaped: the message with the toolbar. */
export function SlackCommentView( { view }: { view: Extract< NoteView, { kind: 'comment' } > } ) {
	const actions = useNoteActions( view.note );
	return (
		<VStack spacing={ 3 } className="dashboard-notifications-inbox__slack-thread">
			<SlackToolbar state={ actions } />
			<CommentCard url={ view.url }>
				<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
					<img
						className="dashboard-notifications-inbox__note-avatar dashboard-notifications-inbox__slack-message-avatar"
						src={ view.avatarUrl }
						alt=""
						width={ 40 }
						height={ 40 }
					/>
					<VStack spacing={ 1 } className="dashboard-notifications-inbox__column">
						<HStack
							spacing={ 2 }
							justify="flex-start"
							alignment="center"
							expanded={ false }
							className="dashboard-notifications-inbox__slack-message-head"
						>
							<TitleText segments={ view.author } />
							<Timestamp timestamp={ view.timestamp } url={ view.url } />
						</HStack>
						<div className="dashboard-notifications-inbox__body">
							<Text className="dashboard-notifications-inbox__block-text">
								<BlockText block={ view.body } />
							</Text>
						</div>
						<UndoBar state={ actions } />
						{ actions.error && (
							<Notice status="error" isDismissible onRemove={ actions.clearError }>
								{ actions.error }
							</Notice>
						) }
						{ actions.mode === 'reply' && <ReplyBox state={ actions } /> }
						{ actions.mode === 'edit' && <EditBox state={ actions } /> }
					</VStack>
				</HStack>
			</CommentCard>
			<Postscript blocks={ view.postscript } />
		</VStack>
	);
}

/**
 * The Slack shape: the new message leads, and the thread it answers sits
 * beneath it as an inset card — newest first, context second.
 */
export default function SlackThreadView( {
	view,
}: {
	view: Extract< NoteView, { kind: 'thread' } >;
} ) {
	const { parent, reply, note } = view;
	const parentDetails = useParentCommentDetails( note );
	const actions = useNoteActions( note );

	return (
		<VStack spacing={ 3 } className="dashboard-notifications-inbox__slack-thread">
			<SlackToolbar state={ actions } />
			<CommentCard url={ view.url }>
				<HStack spacing={ 3 } justify="flex-start" alignment="flex-start">
					<Avatar
						user={ reply.author }
						size={ 40 }
						className="dashboard-notifications-inbox__slack-message-avatar"
					/>
					<VStack spacing={ 1 } className="dashboard-notifications-inbox__column">
						<HStack
							spacing={ 2 }
							justify="flex-start"
							alignment="center"
							expanded={ false }
							className="dashboard-notifications-inbox__slack-message-head"
						>
							{ reply.author && <UserName user={ reply.author } /> }
							<Timestamp timestamp={ view.timestamp } url={ view.url } />
						</HStack>
						{ reply.body && (
							<div className="dashboard-notifications-inbox__body">
								<Text className="dashboard-notifications-inbox__block-text">
									<BlockText block={ reply.body } />
								</Text>
							</div>
						) }
						<UndoBar state={ actions } />
						{ actions.error && (
							<Notice status="error" isDismissible onRemove={ actions.clearError }>
								{ actions.error }
							</Notice>
						) }
						{ actions.mode === 'reply' && <ReplyBox state={ actions } /> }
						{ actions.mode === 'edit' && <EditBox state={ actions } /> }
						<div className="dashboard-notifications-inbox__slack-parent-card">
							<VStack spacing={ 1 }>
								<HStack spacing={ 2 } justify="flex-start" alignment="center" expanded={ false }>
									{ parent.avatarUrl && (
										<img
											className="dashboard-notifications-inbox__user-row-avatar"
											src={ parent.avatarUrl }
											alt=""
											width={ 24 }
											height={ 24 }
										/>
									) }
									<TitleText segments={ parent.author } />
									{ parentDetails?.date && (
										<Timestamp
											timestamp={ parentDetails.date }
											url={ parent.url ?? parentDetails.url }
										/>
									) }
								</HStack>
								<Text variant="muted">
									{ createInterpolateElement(
										/* translators: <post/> is the post the thread belongs to. */
										__( 'From a thread on <post />' ),
										{
											post: parent.postLink?.url ? (
												<a href={ parent.postLink.url } target="_blank" rel="noreferrer">
													{ parent.postLink.text }
												</a>
											) : (
												<span>{ parent.postLink?.text ?? '' }</span>
											),
										}
									) }
								</Text>
								<Text className="dashboard-notifications-inbox__body">
									{ parent.excerpt }
									{ parent.url && parent.isTruncated && (
										<>
											{ ' ' }
											<ExternalLink href={ parent.url }>{ __( 'Continue reading' ) }</ExternalLink>
										</>
									) }
								</Text>
							</VStack>
						</div>
					</VStack>
				</HStack>
			</CommentCard>
			<Postscript blocks={ view.postscript } />
		</VStack>
	);
}
