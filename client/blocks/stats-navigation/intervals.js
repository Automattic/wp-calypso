/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { intervals } from './constants';
import SegmentedControl from 'components/segmented-control';

/**
 * Style dependencies
 */
import './intervals.scss';

const Intervals = ( props ) => {
	const { selected, pathTemplate, className, standalone } = props;
	const classes = classnames( 'stats-navigation__intervals', className, {
		'is-standalone': standalone,
	} );
	return (
		<SegmentedControl compact primary className={ classes }>
			{ intervals.map( ( i ) => {
				const path = pathTemplate.replace( /{{ interval }}/g, i.value );
				return (
					<SegmentedControl.Item key={ i.value } path={ path } selected={ i.value === selected }>
						{ i.label }
					</SegmentedControl.Item>
				);
			} ) }
		</SegmentedControl>
	);
};

Intervals.propTypes = {
	className: PropTypes.string,
	pathTemplate: PropTypes.string.isRequired,
	selected: PropTypes.string.isRequired,
	standalone: PropTypes.bool,
};

Intervals.defaultProps = {
	standalone: false,
};

export default Intervals;
