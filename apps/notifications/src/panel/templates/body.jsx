import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { html } from '../indices-to-html';
import { bumpStat } from '../rest-client/bump-stat';
import { wpcom } from '../rest-client/wpcom';
import NoteActions from './actions';
import Comment from './block-comment';
import Post from './block-post';
import User from './block-user';
import { p, zipWithSignature } from './functions';
import NotePreface from './preface';

/* eslint-disable wpcalypso/jsx-classname-namespace */

function ReplyBlock( { block } ) {
	// explicitly send className of '' here so we don't get the default of "paragraph"
	const replyText = p( html( block ), '' );

	return <div className="wpnc__reply">{ replyText }</div>;
}

export class NoteBody extends Component {
	state = {
		reply: null,
	};

	isMounted = false;

	componentDidMount() {
		this.isMounted = true;

		const { note } = this.props;
		bumpStat( 'notes-click-type', note.type );

		if ( note.meta && note.meta.ids.reply_comment ) {
			const hasReplyBlock = note.body.some(
				( block ) =>
					block.ranges &&
					block.ranges.length > 1 &&
					block.ranges[ 1 ].id === note.meta.ids.reply_comment
			);

			if ( ! hasReplyBlock ) {
				wpcom()
					.site( note.meta.ids.site )
					.comment( note.meta.ids.reply_comment )
					.get( ( error, data ) => {
						if ( error || ! this.isMounted ) {
							return;
						}

						this.setState( { reply: data } );
					} );
			}
		}
	}

	componentWillUnmount() {
		this.isMounted = false;
	}

	render() {
		let blocks = zipWithSignature( this.props.note.body, this.props.note );
		let actions = '';
		let preface = '';
		let replyBlock = null;
		let replyMessage;
		let firstNonTextIndex;
		let i;

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

		const body = [];
		for ( i = 0; i < blocks.length; i++ ) {
			const block = blocks[ i ];
			const blockKey = 'block-' + this.props.note.id + '-' + i;

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
					body.push( <div key={ blockKey }>{ p( html( block.block ) ) }</div> );
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
	}
}

/* eslint-enable wpcalypso/jsx-classname-namespace */

export default localize( NoteBody );
