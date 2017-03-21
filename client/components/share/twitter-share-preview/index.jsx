/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

//Mostly copied from Seo Preview

export class TwitterSharePreview extends PureComponent {
	render() {
		const {
			url,
			title,
			type,
			description,
			image
		} = this.props;

		const previewImageStyle = {
			backgroundImage: 'url(' + image + ')'
		};

		return (
			<div className="twitter-share-preview">
				<div className={ `twitter-share-preview__${ type }` }>
					{ image &&
					<div className="twitter-share-preview__image" style={ previewImageStyle } />
					}
					<div className="twitter-share-preview__body">
						<div className="twitter-share-preview__title">
							{ title }
						</div>
						<div className="twitter-share-preview__description">
							{ description }
						</div>
						<div className="twitter-share-preview__url">
							{ baseDomain( url ) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

TwitterSharePreview.propTypes = {
	url: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string
};

export default TwitterSharePreview;
