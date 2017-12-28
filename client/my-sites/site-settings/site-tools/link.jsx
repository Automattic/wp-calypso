/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';

const SiteToolsLink = ( { description, href, isWarning, onClick, title } ) => {
	const titleClasses = classNames( 'site-tools__section-title', {
		'is-warning': isWarning,
	} );

	return (
		<CompactCard href={ href } onClick={ onClick } className="site-tools__link">
			<div className="site-tools__content">
				<p className={ titleClasses }>{ title }</p>
				<p className="site-tools__section-desc">{ description }</p>
			</div>
		</CompactCard>
	);
};

SiteToolsLink.propTypes = {
	description: PropTypes.string,
	href: PropTypes.string,
	isWarning: PropTypes.bool,
	onClick: PropTypes.func,
	title: PropTypes.string,
};

SiteToolsLink.defaultProps = {
	isWarning: false,
	onClick: noop,
};

export default SiteToolsLink;
