import { Component } from 'react';
import { html } from '../indices-to-html';
import { linkProps } from './functions';
import Gridicon from './gridicons';

const Snippet = ( { note, snippet, url } ) => (
	<a href={ url } { ...linkProps( note ) } target="_blank" rel="noopener noreferrer">
		<span className="wpnc__excerpt">{ snippet.text }</span>
	</a>
);

class UserHeader extends Component {
	render() {
		const grav = this.props.user.media[ 0 ];
		const grav_tag = <img src={ grav.url } height={ grav.height } width={ grav.width } />;
		const home_url = this.props.user.ranges[ 0 ].url;
		const note = this.props.note;

		const get_home_link = function ( classNames, children ) {
			if ( home_url ) {
				return (
					<a className={ classNames } href={ home_url } target="_blank" rel="noopener noreferrer">
						{ children }
					</a>
				);
			}
			return (
				<a className={ classNames + ' disabled' } disabled="disabled">
					{ children }
				</a>
			);
		};

		if ( this.props.user.ranges.length > 1 ) {
			const usercopy = {};
			usercopy.ranges = this.props.user.ranges;
			usercopy.text = this.props.user.text;
			return (
				<div className="wpnc__user wpnc__header">
					<img src={ grav.url } />
					<div
						className="wpnc__user__usertitle"
						dangerouslySetInnerHTML={ {
							__html: html( usercopy ),
						} }
					/>
					<Snippet note={ note } snippet={ this.props.snippet } url={ this.props.url } />
				</div>
			);
		}
		return (
			<div className="wpnc__user wpnc__header">
				{ get_home_link( 'wpnc__user__site', grav_tag ) }
				<div>
					<span className="wpnc__user__username">
						{ get_home_link( 'wpnc__user__home', this.props.user.text ) }
					</span>
				</div>
				<Snippet note={ note } snippet={ this.props.snippet } url={ this.props.url } />
			</div>
		);
	}
}

class WritingPromptHeader extends Component {
	render() {
		const icon = this.props.site.media[ 0 ];
		const img_tag = <img src={ icon.url } height={ icon.height } width={ icon.width } />;
		const home_url = this.props.site.ranges[ 0 ].url;
		const settings_url =
			'/me/notifications#' + home_url?.replace( 'https://', '' ).replace( 'http://', '' );

		const get_home_link = function ( classNames, children ) {
			if ( home_url ) {
				return (
					<a className={ classNames } href={ home_url } target="_blank" rel="noopener noreferrer">
						{ children }
					</a>
				);
			}
			return (
				<a className={ classNames + ' disabled' } disabled="disabled">
					{ children }
				</a>
			);
		};

		return (
			<div className="wpnc__user wpnc__header">
				{ img_tag }
				<div>
					<span className="wpnc__user__username">
						<span className="wpnc__excerpt">{ this.props.prompt.text }</span>
						<a href={ settings_url } target="_blank" rel="noopener noreferrer">
							<Gridicon icon="bell-off" />
						</a>
					</span>
				</div>
				{ get_home_link( 'wpnc__user__home', this.props.site.text ) }
			</div>
		);
	}
}

class Header extends Component {
	render() {
		const subject = (
			<div
				className="wpnc__subject"
				dangerouslySetInnerHTML={ {
					__html: html( this.props.subject ),
				} }
			/>
		);

		return (
			<div className="wpnc__summary">
				{ subject }
				<Snippet note={ this.props.note } snippet={ this.props.snippet } url={ this.props.url } />
			</div>
		);
	}
}

class SummaryInSingle extends Component {
	render() {
		let header_url = this.props.note.url;
		let parser;
		if ( ! this.props.note.header || 0 === this.props.note.header.length ) {
			return <span />;
		}

		if ( this.props.note.header.length > 1 ) {
			if ( 'user' === this.props.note.header[ 0 ].ranges[ 0 ].type ) {
				if ( this.props.note.type === 'comment' ) {
					if ( this.props.note.meta.ids.parent_comment ) {
						parser = document.createElement( 'a' );
						parser.href = this.props.note.url;
						parser.hash = '#comment-' + this.props.note.meta.ids.parent_comment;
						header_url = parser.href;
					}
				}
				return (
					<UserHeader
						note={ this.props.note }
						snippet={ this.props.note.header[ 1 ] }
						url={ header_url }
						user={ this.props.note.header[ 0 ] }
					/>
				);
			}
			if ( this.props.note.type === 'writing_prompts_note' ) {
				return (
					<WritingPromptHeader
						note={ this.props.note }
						prompt={ this.props.note.header[ 1 ] }
						url={ header_url }
						site={ this.props.note.header[ 0 ] }
					/>
				);
			}
			return (
				<Header
					note={ this.props.note }
					snippet={ this.props.note.header[ 1 ] }
					subject={ this.props.note.header[ 0 ] }
					url={ header_url }
				/>
			);
		}
		return (
			<Header
				note={ this.props.note }
				snippet={ '' }
				subject={ this.props.note.header[ 0 ] }
				url={ header_url }
			/>
		);
	}
}

export default SummaryInSingle;
