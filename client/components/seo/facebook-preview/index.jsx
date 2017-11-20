/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { compact } from 'lodash';
import { firstValid, hardTruncation, shortEnough } from '../helpers';

const TITLE_LENGTH = 80;
const DESCRIPTION_LENGTH = 270;

const baseDomain = url =>
	url
		.replace( /^[^/]+[/]*/, '' ) // strip leading protocol
		.replace( /\/.*$/, '' ); // strip everything after the domain

const facebookTitle = firstValid( shortEnough( TITLE_LENGTH ), hardTruncation( TITLE_LENGTH ) );

const facebookDescription = firstValid(
	shortEnough( DESCRIPTION_LENGTH ),
	hardTruncation( DESCRIPTION_LENGTH )
);

export class FacebookPreview extends PureComponent {
	render() {
		const { url, type, title, description, image, author } = this.props;

		return (
			<div className={ `facebook-preview facebook-preview__${ type }` }>
				<div className="facebook-preview__content">
					{ image && (
						<div className="facebook-preview__image">
							<img src={ image } />
						</div>
					) }
					<div className="facebook-preview__body">
						<div className="facebook-preview__title">{ facebookTitle( title || '' ) }</div>
						<div className="facebook-preview__description">
							{ facebookDescription( description || '' ) }
						</div>
						<div className="facebook-preview__url">
							{ compact( [ baseDomain( url ), author ] ).join( ' | ' ) }
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
	author: PropTypes.string,
};

export default FacebookPreview;
