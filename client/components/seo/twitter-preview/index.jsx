/** @ssr-ready **/
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

export class TwitterPreview extends PureComponent {
	render() {
		const {
			url,
			title,
			type,
			description,
			image
		} = this.props;

		var previewImageStyle = {
			backgroundImage: 'url(' + image + ')'
		}

		return (
			<div className="twitter-card-preview__container">
				<div className={ `twitter-card-preview twitter-card-preview__${ type }` }>
					<div className="twitter-card-preview__image" style={ previewImageStyle }>
					</div>
					<div className="twitter-card-preview__body">
						<div className="twitter-card-preview__title">
							{ title }
						</div>
						<div className="twitter-card-preview__description">
							{ description }
						</div>
						<div className="twitter-card-preview__url">
							{ baseDomain( url ) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

TwitterPreview.propTypes = {
	url: PropTypes.string,
	title: PropTypes.string,
	type: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string
};

export default TwitterPreview;
