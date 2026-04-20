import { __experimentalVStack as VStack, CardFooter, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getActions } from '../../panel/helpers/notes';
import { html } from '../../panel/indices-to-html';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';
import getIsNoteApproved from '../../panel/state/selectors/get-is-note-approved';
import { p, zipWithSignature } from '../../panel/templates/functions';
import PendingApprovalBadge from '../../shared/pending-approval-badge';
import NoteActions from './actions';
import Comment from './block-comment';
import Post from './block-post';
import PromptBlock from './block-prompt';
import User from './block-user';
import NotePreface from './preface';
import type { Note, Block, BlockWithSignature } from '../types';

const isReplyBlock = ( note: Note, block: Block ) =>
	block.ranges && block.ranges.length > 1 && block.ranges[ 1 ].id === note.meta?.ids?.reply_comment;

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
		<CardFooter
			size="small"
			style={ { position: 'sticky', bottom: 0, background: '#fff', zIndex: 1 } }
		>
			<NoteActions note={ note } goBack={ goBack } />
		</CardFooter>
	);
};

export const NoteBody = ( { note }: { note: Note } ) => {
	const blocks: BlockWithSignature[] = zipWithSignature( note.body, note );
	const isApproved = useSelector( ( state ) => getIsNoteApproved( state, note ) );
	const actions = getActions( note );
	const hasAction = ( types: string | string[] ) => {
		const typeArray = Array.isArray( types ) ? types : [ types ];
		return typeArray.some( ( type ) => actions.hasOwnProperty( type ) );
	};
	const showPendingApprovalBadge = hasAction( 'approve-comment' ) && ! isApproved;

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
					<PendingApprovalBadge note={ note } />
				</div>
			) }
			<div className="wpnc__body-content">{ body }</div>
			<ReplyBlock note={ note } />
		</VStack>
	);
};
