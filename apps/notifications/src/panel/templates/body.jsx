import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';

import { wpcom } from '../rest-client/wpcom';

import Comment from './block-comment';
import NoteActions from './actions';
import NotePreface from './preface';
import Post from './block-post';
import User from './block-user';

import { bumpStat } from '../rest-client/bump-stat';

import { html } from '../indices-to-html';
import { p, zipWithSignature } from './functions';

class ReplyBlock extends React.Component {
	render() {
		// explicitly send className of '' here so we don't get the default of
		// "paragraph"
		var replyText = p( html( this.props.block ), '' );

		return <div className="wpnc__reply">{ replyText }</div>;
	}
}

export const NoteBody = createReactClass( {
	displayName: 'NoteBody',

	getInitialState: function () {
		return {
			reply: null,
		};
	},

	componentDidMount: function () {
		bumpStat( 'notes-click-type', this.props.note.type );
	},

	replyLoaded: function ( error, data ) {
		if ( error || ! this.isMounted() ) {
			return;
		}

		this.setState( { reply: data } );
	},

	UNSAFE_componentWillMount: function () {
		var note = this.props.note,
			hasReplyBlock;

		if ( note.meta && note.meta.ids.reply_comment ) {
			hasReplyBlock =
				note.body.filter( function ( block ) {
					return (
						block.ranges &&
						block.ranges.length > 1 &&
						block.ranges[ 1 ].id == note.meta.ids.reply_comment
					);
				} ).length > 0;

			if ( ! hasReplyBlock ) {
				wpcom()
					.site( this.props.note.meta.ids.site )
					.comment( this.props.note.meta.ids.reply_comment )
					.get( this.replyLoaded );
			}
		}
	},

	render: function () {
		var blocks = zipWithSignature( this.props.note.body, this.props.note );
		var actions = '';
		var preface = '';
		var replyBlock = null;
		var replyMessage;
		var firstNonTextIndex;
		var i;

		for ( i = 0; i < blocks.length; i++ ) {
			if ( 'text' !== blocks[ i ].signature.type ) {
				firstNonTextIndex = i;
				break;
			}
		}

		if ( firstNonTextIndex ) {
			preface = <NotePreface blocks={ this.props.note.body.slice( 0, i ) } />;
			blocks = blocks.slice( i );
		}

		var body = [];
		for ( i = 0; i < blocks.length; i++ ) {
			var block = blocks[ i ];
			var blockKey = 'block-' + this.props.note.id + '-' + i;

			if ( block.block.actions && 'user' !== block.signature.type ) {
				actions = (
					<NoteActions
						note={ this.props.note }
						block={ block.block }
						global={ this.props.global }
					/>
				);
			}

			switch ( block.signature.type ) {
				case 'user':
					body.push(
						<User
							key={ blockKey }
							block={ block.block }
							noteType={ this.props.note.type }
							note={ this.props.note }
							timestamp={ this.props.note.timestamp }
							url={ this.props.note.url }
						/>
					);
					break;
				case 'comment':
					body.push(
						<Comment key={ blockKey } block={ block.block } meta={ this.props.note.meta } />
					);
					break;
				case 'post':
					body.push(
						<Post key={ blockKey } block={ block.block } meta={ this.props.note.meta } />
					);
					break;
				case 'reply':
					replyBlock = <ReplyBlock key={ blockKey } block={ block.block } />;
					break;
				default:
					body.push( p( html( block.block ) ) );
					break;
			}
		}

		if ( this.state.reply && this.state.reply.URL ) {
			if ( this.props.note.meta.ids.comment ) {
				replyMessage = this.props.translate( 'You {{a}}replied{{/a}} to this comment.', {
					components: {
						a: <a href={ this.state.reply.URL } target="_blank" rel="noopener noreferrer" />,
					},
				} );
			} else {
				replyMessage = this.props.translate( 'You {{a}}replied{{/a}} to this post.', {
					components: {
						a: <a href={ this.state.reply.URL } target="_blank" rel="noopener noreferrer" />,
					},
				} );
			}

			replyBlock = (
				<div className="wpnc__reply">
					<span className="wpnc__gridicon"></span>
					{ replyMessage }
				</div>
			);
		}

		return (
			<div className="wpnc__body">
				{ preface }
				<div className="wpnc__body-content">{ body }</div>
				{ replyBlock }
				{ actions }
			</div>
		);
	},
} );

export default localize( NoteBody );
