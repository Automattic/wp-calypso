/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureComponent from 'react-pure-render/component';

import {
	firstValid,
	hardTruncation,
	shortEnough
} from '../helpers';

const TITLE_LENGTH = 40;
const DESCRIPTION_LENGTH = 300;

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

export class FacebookPreview extends PureComponent {
	render() {
		const {
			url,
			type,
			title,
			description,
			image
		} = this.props;

		return (
			<div className={ `facebook-preview facebook-preview__${ type }` }>
				<div className="facebook-preview__content">
					<div className="facebook-preview__image">
						<img src={ image } />
					</div>
					<div className="facebook-preview__body">
						<div className="facebook-preview__title">
							{ facebookTitle( title || '' ) }
						</div>
						<div className="facebook-preview__description">
							{ facebookDescription( description || '' ) }
						</div>
						<div className="facebook-preview__url">
							{ baseDomain( url ) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

FacebookPreview.propTypes = {
	url: PropTypes.string,
	type: PropTypes.string,
	title: PropTypes.string,
	description: PropTypes.string,
	image: PropTypes.string,
};

export default FacebookPreview;
