/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */

const ProcessOrdersWidget = ( { className, site } ) => {
	return (
		<div className={ className } >
			{ site.slug }
		</div>
	);
};

ProcessOrdersWidget.propTypes = {
	className: PropTypes.string,
	site: React.PropTypes.shape( {
		slug: React.PropTypes.string.isRequired,
	} )
};

export default ProcessOrdersWidget;
