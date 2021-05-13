/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

const SharingServiceExample = ( { image, label, single } ) => (
	<div className={ classNames( 'sharing-service-example', { 'is-single': single } ) }>
		<div className="sharing-service-example-screenshot">
			<img src={ image.src } alt={ image.alt } />
		</div>
		<div className="sharing-service-example-screenshot-label">{ label }</div>
	</div>
);

SharingServiceExample.propTypes = {
	image: PropTypes.shape( {
		src: PropTypes.string,
		alt: PropTypes.string,
	} ),
	label: PropTypes.node,
	single: PropTypes.bool,
};

SharingServiceExample.defaultProps = {
	single: false,
};

export default SharingServiceExample;
