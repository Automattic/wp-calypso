/** @ssr-ready **/

import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';
import { localize } from 'i18n-calypso';

import humanDate from 'lib/human-date';

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export class ReaderPreview extends PureComponent {
	render() {
		const {
			translate,
			siteTitle,
			siteSlug,
			siteUrl,
			siteIcon,
			postTitle,
			postExcerpt,
			postImage,
			postDate,
			authorName,
			authorIcon
		} = this.props;

		return (
			<article className="reader-preview">
				<div className="reader__post-header">
					<div className="site has-edit-capabilities">
						<div className="site__content" title={ siteTitle }>
							<div className="site-icon">
								<img className="site-icon__img" src={ siteIcon } />
							</div>
							<div className="site__info">
								<div className="site__title">{ siteTitle }</div>
								<div className="site__domain">{ siteSlug }</div>
							</div>
						</div>
					</div>
				</div>
				{ postImage &&
					<div className="reader__post-featured-image">
						<img className="reader__post-featured-image-image" src={ postImage } />
					</div>
				}
				<div className="reader-preview__text">
				{ postTitle &&
					<h1 className="reader__post-title">{ postTitle }</h1>
				}
				{ authorName &&
					<ul className="reader-post-byline">
						<li className="reader-post-byline__author">
							<a href="#" className="external-link">
								<img className="gravatar" src={ authorIcon } width="16" height="16" />
								<span className="byline__author-name">{ authorName }</span>
							</a>
						</li>
						<li className="reader-post-byline__date">
							<a className="reader-post-byline__date-link" href="#">{ humanDate( postDate ) }</a>
						</li>
					</ul>
				}
				{ postExcerpt &&
					<div className="post-excerpt"><p>{ postExcerpt }</p></div>
				}
				</div>
			</article>
		);
	}
}

ReaderPreview.propTypes = {
	siteTitle: PropTypes.string,
	siteSlug: PropTypes.string,
	siteUrl: PropTypes.string,
	siteIcon: PropTypes.string,
	postTitle: PropTypes.string,
	postExcerpt: PropTypes.string,
	postImage: PropTypes.string,
	postDate: PropTypes.string,
	authorName: PropTypes.string,
	authorIcon: PropTypes.string
};

export default localize( ReaderPreview );
