/** @ssr-ready **/

import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export class ReaderPreview extends PureComponent {
	render() {
		const {
			url,
			slug,
			title,
			type,
			description,
			siteIcon,
			image,
		} = this.props;

		return (
			<article className="reader-preview__post">
				<div className="reader__post-header">
					<div className="site has-edit-capabilities">
						<div className="site__content" title={ title }>
							<div className="site-icon">
								<img className="site-icon__img" src={ siteIcon } />
							</div>
							<div className="site__info">
								<div className="site__title">{ title }</div>
								<div className="site__domain">{ slug }</div>
							</div>
						</div>
					</div>
				</div>
				<div className="reader-preview__image">
					<img src={ image } />
				</div>
				<div className="reader-preview__text">
					<h1 className="reader__post-title">{ title }</h1>
					<ul className="reader-post-byline">
						<li className="reader-post-byline__author">
							<a href="http://zandyring.com" className="external-link">
								<img className="gravatar" src={ image } width="24" height="24" />
								<span className="byline__author-name">Darth Vader</span>
							</a>
						</li>
						<li className="reader-post-byline__date">
							<a className="reader-post-byline__date-link" href="#">Now</a>
						</li>
					</ul>
					<div className="post-excerpt"><p>We are excited to announce that Mildred Bay, MD is joining our practice in September 2016. She has been in practice in Port Angeles for the past 11 years and is relocating with her family to the Seattle area at the &ellip;</p></div>
				</div>
			</article>
		);
	}
}

ReaderPreview.propTypes = {
	url: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string
};

export default ReaderPreview;
