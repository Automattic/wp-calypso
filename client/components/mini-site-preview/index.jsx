/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

const MiniSitePreview = ( { className, imageSrc } ) =>
	imageSrc ? (
		<div className={ classnames( 'mini-site-preview', className ) }>
			<div className="mini-site-preview__browser-chrome">
				<span>● ● ●</span>
			</div>
			<div className="mini-site-preview__image">
				<img className="mini-site-preview__favicon" src={ imageSrc } alt="Site favicon" />
			</div>
		</div>
	) : null;

MiniSitePreview.propTypes = {
	className: PropTypes.string,
	imageSrc: PropTypes.string,
};

export default MiniSitePreview;
