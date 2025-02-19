/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Component } from 'react';
import { withoutHttp } from 'calypso/lib/url';
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
		const grav_tag = <img src={ grav.url } height={ grav.height } width={ grav.width } alt="" />;
		const base_home_url = this.props.user.ranges[ 0 ].url;
		// Some site notifications populate Id with the siteId, so consider the userId falsy in this
		// case.
		const userId =
			this.props.user.ranges[ 0 ].id !== this.props.user.ranges[ 0 ].site_id &&
			this.props.user.ranges[ 0 ].id;
		const home_url = userId ? `https://wordpress.com/reader/users/${ userId }` : base_home_url;
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
				// eslint-disable-next-line jsx-a11y/anchor-is-valid
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
					<img src={ grav.url } alt="" />
					<div
						className="wpnc__user__usertitle"
						// eslint-disable-next-line react/no-danger
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

class BloggingPromptHeader extends Component {
	render() {
		const icon = this.props.site.media[ 0 ];
		const img_tag = <img src={ icon.url } height={ icon.height } width={ icon.width } alt="" />;
		const home_url = this.props.site.ranges[ 0 ].url;
		// Notifications are hosted on widgets.wp.com on WordPress.com
		const host =
			document.location.host === 'widgets.wp.com' ? 'wordpress.com' : document.location.host;
		const settings_url =
			document.location.protocol + '//' + host + '/me/notifications#' + withoutHttp( home_url );

		const get_home_link = function ( classNames, children ) {
			if ( home_url ) {
				return (
					<a className={ classNames } href={ home_url } target="_blank" rel="noopener noreferrer">
						{ children }
					</a>
				);
			}
			return (
				// eslint-disable-next-line jsx-a11y/anchor-is-valid
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
				// eslint-disable-next-line react/no-danger
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
			if ( this.props.note.type === 'blogging_prompts_note' ) {
				return (
					<BloggingPromptHeader
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
				snippet=""
				subject={ this.props.note.header[ 0 ] }
				url={ header_url }
			/>
		);
	}
}

export default SummaryInSingle;
