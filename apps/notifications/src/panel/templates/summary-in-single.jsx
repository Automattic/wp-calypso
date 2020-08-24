import React from 'react';

import { html } from '../indices-to-html';
import { linkProps } from './functions';

const Snippet = ( { note, snippet, url } ) => (
	<a href={ url } { ...linkProps( note ) } target="_blank" rel="noopener noreferrer">
		<span className="wpnc__excerpt">{ snippet.text }</span>
	</a>
);

class UserHeader extends React.Component {
	render() {
		var grav = this.props.user.media[ 0 ];
		var grav_tag = <img src={ grav.url } height={ grav.height } width={ grav.width } />;
		var home_url = this.props.user.ranges[ 0 ].url;
		const note = this.props.note;

		var get_home_link = function ( classNames, children ) {
			if ( home_url ) {
				return (
					<a className={ classNames } href={ home_url } target="_blank" rel="noopener noreferrer">
						{ children }
					</a>
				);
			} else {
				return (
					<a className={ classNames + ' disabled' } disabled="disabled">
						{ children }
					</a>
				);
			}
		};

		if ( this.props.user.ranges.length > 1 ) {
			var usercopy = {};
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
		} else {
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
}

var Header = React.createFactory(
	class extends React.Component {
		render() {
			var subject = (
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
);

class SummaryInSingle extends React.Component {
	render() {
		var header_url, parser;
		if ( ! this.props.note.header || 0 === this.props.note.header.length ) {
			return <span />;
		}

		if ( this.props.note.header.length > 1 ) {
			if ( 'user' === this.props.note.header[ 0 ].ranges[ 0 ].type ) {
				header_url = this.props.note.url;
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
			return (
				<Header
					note={ this.props.note }
					snippet={ this.props.note.header[ 1 ] }
					subject={ this.props.note.header[ 0 ] }
					url={ this.props.note.url }
				/>
			);
		} else {
			return (
				<Header
					note={ this.props.note }
					snippet={ '' }
					subject={ this.props.note.header[ 0 ] }
					url={ this.props.note.url }
				/>
			);
		}
	}
}

export default SummaryInSingle;
