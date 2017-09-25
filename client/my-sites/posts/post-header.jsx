/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteIcon from 'blocks/site-icon';
import { getSiteSlug, getSiteTitle } from 'state/sites/selectors';

class PostHeader extends PureComponent {
	static defaultProps = {
		showAuthor: false
	}

	getAuthor() {
		return this.props.translate(
			'By %(author)s',
			{ args: { author: this.props.author } }
		);
	}

	render() {
		const classes = classNames( {
			post__header: true,
			'has-author': this.props.showAuthor
		} );

		return (
			<div className={ classes }>
				<SiteIcon site={ this.props.site } size={ 32 } />
				<h4 className="post__site-title">
					<a href={ this.props.path + '/' + this.props.siteSlug }>
						{ this.props.siteTitle }
					</a>
				</h4>
				{ this.props.showAuthor ? <span className="post__author">{ this.getAuthor() }</span> : null }
			</div>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteSlug: getSiteSlug( state, siteId ),
		siteTitle: getSiteTitle( state, siteId ),
	} )
)( localize( PostHeader ) );
