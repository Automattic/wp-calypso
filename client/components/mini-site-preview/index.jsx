/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

const MiniSitePreview = ( { imageSrc } ) =>
	imageSrc ? (
		<div className="mini-site-preview">
			<div className="mini-site-preview__browser-chrome">
				<span>● ● ●</span>
			</div>
			<div className="mini-site-preview__image">
				<img className="mini-site-preview__favicon" src={ imageSrc } alt="Site favicon" />
			</div>
		</div>
	) : null;

MiniSitePreview.propTypes = {
	imageSrc: PropTypes.string,
};

export default MiniSitePreview;
