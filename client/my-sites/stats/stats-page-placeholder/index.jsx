/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'client/components/card';

const StatsPagePlaceholder = props => (
	<div className={ classnames( 'main is-wide-layout', props.className ) }>
		<Card className="stats-module stats-page-placeholder__header is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
		<Card className="stats-module stats-page-placeholder__content is-loading">
			<div className="module-header">
				<h3 className="module-header-title" />
			</div>
		</Card>
	</div>
);

StatsPagePlaceholder.propTypes = {
	className: PropTypes.string,
};

export default StatsPagePlaceholder;
