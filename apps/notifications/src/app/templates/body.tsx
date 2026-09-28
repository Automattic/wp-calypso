import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	CardFooter,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getModerateCommentsLink } from '../../panel/helpers/notes';
import { html } from '../../panel/indices-to-html';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';
import getIsNotePendingApproval from '../../panel/state/selectors/get-is-note-pending-approval';
import { p, zipWithSignature } from '../../panel/templates/functions';
import NoteActions from './actions';
import Comment from './block-comment';
import Post from './block-post';
import PromptBlock from './block-prompt';
import User from './block-user';
import NotePreface from './preface';
import type { Note, Block, BlockWithSignature } from '../types';

const isReplyBlock = ( note: Note, block: Block ) =>
	block.ranges && block.ranges.length > 1 && block.ranges[ 1 ].id === note.meta?.ids?.reply_comment;

const PendingApprovalStrip = ( { note }: { note: Note } ) => {
	const commentsUrl = getModerateCommentsLink( note );

	return (
		<HStack className="wpnc__pending-approval-strip" spacing={ 1.5 } justify="space-between">
			<span className="wpnc__pending-approval-strip-text">{ __( 'Pending approval' ) }</span>
			{ commentsUrl && (
				<ExternalLink className="wpnc__pending-approval-strip-link" href={ commentsUrl }>
					{ __( 'Manage comments' ) }
				</ExternalLink>
			) }
		</HStack>
	);
};

const ReplyBlock = ( { note }: { note: Note } ) => {
	const [ replyURL, setReplyURL ] = useState< string >( '' );
	const replyBlock = note.body.find( ( block ) => isReplyBlock( note, block ) );
	const replyText = useMemo( () => {
		if ( ! replyBlock ) {
			return null;
		}

		// explicitly send className of '' here so we don't get the default of "paragraph"
		return p( html( replyBlock ), '' );
	}, [ replyBlock ] );

	useEffect( () => {
		if ( replyBlock ) {
			return;
		}

		const { site: siteId, reply_comment: replyCommentId } = note.meta?.ids || {};
		if ( ! siteId || ! replyCommentId ) {
			return;
		}

		wpcom()
			.site( siteId )
			.comment( replyCommentId )
			.get( ( error: Error | null, data: { URL: string } ) => {
				if ( ! error ) {
					setReplyURL( data.URL );
				}
			} );
	}, [ note, replyBlock ] );

	if ( replyText ) {
		return <div className="wpnc__reply">{ replyText }</div>;
	}

	if ( replyURL ) {
		const replyMessage = createInterpolateElement(
			note.meta?.ids?.comment
				? __( 'You <a>replied</a> to this comment.' )
				: __( 'You <a>replied</a> to this post.' ),
			{
				a: <ExternalLink href={ replyURL } children={ null } />,
			}
		);

		return (
			<div className="wpnc__reply">
				<span className="wpnc__gridicon"></span>
				{ replyMessage }
			</div>
		);
	}

	return null;
};

export const ActionBlock = ( { note, goBack }: { note: Note; goBack: () => void } ) => {
	const blocks: BlockWithSignature[] = zipWithSignature( note.body, note );
	const actionBlock = blocks.findLast(
		( block ) => block.block.actions && 'user' !== block.signature.type
	);

	if ( ! actionBlock ) {
		return null;
	}

	return (
		// The body above is the scroll region; this footer is a non-scrolling
		// sibling below it, so it stays visible without sticky positioning. When the
		// reply is short the body sizes to its content and this sits right beneath it.
		<CardFooter size="small">
			<NoteActions note={ note } goBack={ goBack } />
		</CardFooter>
	);
};

export const NoteBody = ( { note }: { note: Note } ) => {
	const blocks: BlockWithSignature[] = zipWithSignature( note.body, note );
	const showPendingApprovalBadge = useSelector( ( state ) =>
		getIsNotePendingApproval( state, note )
	);

	const firstNonTextBlockIndex = blocks.findIndex( ( block ) => {
		return 'text' !== block.signature.type;
	} );

	const preface = firstNonTextBlockIndex > 0 && (
		<NotePreface blocks={ note.body.slice( 0, firstNonTextBlockIndex ) } />
	);

	const restBlocks =
		firstNonTextBlockIndex !== -1 ? blocks.slice( firstNonTextBlockIndex ) : blocks;

	const body = restBlocks
		.filter( ( block ) => ! isReplyBlock( note, block.block ) )
		.map( ( block, i ) => {
			const key = 'block-' + note.id + '-' + i;

			switch ( block.signature.type ) {
				case 'user':
					return <User key={ key } block={ block.block } note={ note } />;
				case 'comment':
					return <Comment key={ key } block={ block.block } meta={ note.meta } />;
				case 'post':
					return <Post key={ key } block={ block.block } />;
				case 'prompt':
					return <PromptBlock key={ key } block={ block.block } />;
				default:
					return <div key={ key }>{ p( html( block.block ) ) }</div>;
			}
		} );

	useEffect( () => {
		bumpStat( 'notes-click-type', note.type );
	}, [ note.type ] );

	return (
		<VStack className="wpnc__body">
			{ preface }
			{ showPendingApprovalBadge && (
				<div className="wpnc__pending-approval-section">
					<PendingApprovalStrip note={ note } />
				</div>
			) }
			<div className="wpnc__body-content">{ body }</div>
			<ReplyBlock note={ note } />
		</VStack>
	);
};
