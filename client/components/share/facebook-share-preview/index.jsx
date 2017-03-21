/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import compact from 'lodash/compact';

import {
	firstValid,
	hardTruncation,
	shortEnough
} from '../helpers';

//Mostly copied from Seo Preview

const TITLE_LENGTH = 80;
const DESCRIPTION_LENGTH = 270;

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

const facebookTitle = firstValid(
	shortEnough( TITLE_LENGTH ),
	hardTruncation( TITLE_LENGTH )
);

const facebookDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export class FacebookSharePreview extends PureComponent {
	render() {
		const {
			url,
			type,
			title,
			description,
			image,
			author
		} = this.props;

		return (
			<div className={ `facebook-share-preview facebook-share-preview__${ type }` }>
				<div className="facebook-share-preview__content">
					{ image &&
					<div className="facebook-share-preview__image">
						<img src={ image } />
					</div>
					}
					<div className="facebook-share-preview__body">
						<div className="facebook-share-preview__title">
							{ facebookTitle( title || '' ) }
						</div>
						<div className="facebook-share-preview__description">
							{ facebookDescription( description || '' ) }
						</div>
						<div className="facebook-share-preview__url">
							{ compact( [ baseDomain( url ), author ] ).join( ' | ' ) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

FacebookSharePreview.propTypes = {
	url: PropTypes.string,
	type: PropTypes.string,
	title: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string,
	author: PropTypes.string
};

export default FacebookSharePreview;
