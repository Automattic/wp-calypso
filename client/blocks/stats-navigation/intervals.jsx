import { SegmentedControl } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { intervals } from './constants';

import './intervals.scss';

const Intervals = ( props ) => {
	const {
		selected,
		pathTemplate,
		className,
		standalone = false,
		compact = true,
		intervalValues = intervals,
		onChange,
		icon,
	} = props;
	const classes = clsx( 'stats-navigation__intervals', className, {
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
	className: PropTypes.string,
	pathTemplate: PropTypes.string,
	selected: PropTypes.string.isRequired,
	standalone: PropTypes.bool,
	intervalValues: PropTypes.array,
	onChange: PropTypes.func,
	icon: PropTypes.object,
};

export default localize( Intervals );
