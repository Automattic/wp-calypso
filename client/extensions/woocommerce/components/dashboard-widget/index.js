/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const DashboardWidget = props => {
	const { children, className, image, imageFlush, imagePosition, title, width } = props;
	const isTopImage = image && 'top' === imagePosition;
	const imageClassName = image ? `is-${ imagePosition }` : null;
	const widthClassName = `is-${ width }-width`;

	const classes = classNames( 'dashboard-widget', className, imageClassName, widthClassName, {
		'is-flush-image': imageFlush,
	} );

	const imageComponent = <img className="dashboard-widget__image" src={ image } />;

	return (
		<Card className={ classes }>
			<div className="dashboard-widget__content">
				{ isTopImage && imageComponent }
				{ image && 'left' === imagePosition && imageComponent }
				<div className="dashboard-widget__children">
					{ title && <h2>{ title }</h2> }
					{ children }
				</div>
				{ image && 'right' === imagePosition && imageComponent }
				{ image && 'bottom' === imagePosition && imageComponent }
			</div>
		</Card>
	);
};

DashboardWidget.propTypes = {
	className: PropTypes.string,
	image: PropTypes.string,
	imageFlush: PropTypes.bool,
	imagePosition: PropTypes.oneOf( [ 'bottom', 'left', 'right', 'top' ] ),
	title: PropTypes.string,
	width: PropTypes.oneOf( [ 'half', 'full', 'third', 'two-thirds' ] ),
};

DashboardWidget.defaultProps = {
	imagePosition: 'top',
	imageFlush: false,
	width: 'full',
};

export default DashboardWidget;
