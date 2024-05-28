import { SegmentedControl } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { intervals } from './constants';

import './intervals.scss';

/**
 * Renders the intervals component.
 * @param {Object} props The component props.
 * @param {string} props.selected The selected interval value.
 * @param {string} props.pathTemplate The path template for each interval.
 * @param {string} [props.className] The additional class name for the component.
 * @param {boolean} [props.standalone] Whether the component is standalone.
 * @param {boolean} [props.compact] Whether the component is compact.
 * @param {Array} [props.intervalValues] The array of interval values.
 * @param {Function} [props.onChange] The function to handle interval change.
 * @param {Object} [props.icon] The icon object.
 * @returns {React.ReactNode} The rendered intervals component.
 */
const Intervals = ( {
	selected,
	pathTemplate,
	className,
	standalone = false,
	compact = true,
	intervalValues = intervals,
	onChange,
	icon,
} ) => {
	const classes = classnames( 'stats-navigation__intervals', className, {
		'is-standalone': standalone,
	} );

	return (
		<SegmentedControl primary className={ classes } compact={ compact }>
			{ intervalValues.map( ( i ) => {
				const path = pathTemplate?.replace( /{{ interval }}/g, i.value );
				return (
					<SegmentedControl.Item
						key={ i.value }
						path={ path }
						selected={ i.value === selected }
						onClick={ () => onChange && onChange( i.value ) }
					>
						{ i.label }
						{ icon && i.value === selected && <Icon className="gridicon" icon={ icon } /> }
					</SegmentedControl.Item>
				);
			} ) }
		</SegmentedControl>
	);
};

Intervals.propTypes = {
	selected: PropTypes.string.isRequired,
	pathTemplate: PropTypes.string,
	className: PropTypes.string,
	standalone: PropTypes.bool,
	compact: PropTypes.bool,
	intervalValues: PropTypes.array,
	onChange: PropTypes.func,
	icon: PropTypes.object,
};

export default localize( Intervals );
