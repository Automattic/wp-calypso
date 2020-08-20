/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */

import { firstValid, hardTruncation, shortEnough, stripHtmlTags } from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

const DESCRIPTION_LENGTH = 200;

const baseDomain = ( url ) =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

const twitterDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export class TwitterPreview extends PureComponent {
	render() {
		const { url, title, type, description, image } = this.props;

		const previewImageStyle = {
			backgroundImage: 'url(' + image + ')',
		};

		return (
			<div className="twitter-preview">
				<div className={ `twitter-preview__${ type }` }>
					{ image && <div className="twitter-preview__image" style={ previewImageStyle } /> }
					<div className="twitter-preview__body">
						<div className="twitter-preview__title">{ title }</div>
						<div className="twitter-preview__description">
							{ twitterDescription( stripHtmlTags( description ) ) }
						</div>
						<div className="twitter-preview__url">{ baseDomain( url || '' ) }</div>
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
	image: PropTypes.string,
};

export default TwitterPreview;
