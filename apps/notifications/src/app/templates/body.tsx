import { __experimentalVStack as VStack, CardFooter, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from 'react';
import { html } from '../../panel/indices-to-html';
import { bumpStat } from '../../panel/rest-client/bump-stat';
import { wpcom } from '../../panel/rest-client/wpcom';
import { p, zipWithSignature } from '../../panel/templates/functions';
import NoteActions from './actions';
import Comment from './block-comment';
import Post from './block-post';
import PromptBlock from './block-prompt';
import User from './block-user';
import NotePreface from './preface';
import type { Note, Block, BlockWithSignature } from '../types';

const isReplyBlock = ( note: Note, block: Block ) =>
	block.ranges && block.ranges.length > 1 && block.ranges[ 1 ].id === note.meta?.ids.reply_comment;

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

		wpcom()
			.site( note.meta.ids.site )
			.comment( note.meta.ids.reply_comment )
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
			note.meta.ids.comment
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
		<CardFooter size="small">
			<NoteActions note={ note } goBack={ goBack } />
		</CardFooter>
	);
};

export const NoteBody = ( { note }: { note: Note } ) => {
	const blocks: BlockWithSignature[] = zipWithSignature( note.body, note );

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
			<div className="wpnc__body-content">{ body }</div>
			<ReplyBlock note={ note } />
		</VStack>
	);
};
