// A grid component adapted from Material-UI's implementation:
// https://material-ui.com/layout/grid/

/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

const GRID_SIZES = [ 'auto', true, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];

function Grid( props ) {
	const {
		alignContent,
		alignItems,
		classes,
		className: classNameProp,
		component: Component,
		container,
		direction,
		item,
		justify,
		lg,
		md,
		sm,
		wrap,
		xl,
		xs,
		zeroMinWidth,
		...other
	} = props;

	const classname = classnames(
		{
			'muriel-grid-container': container,
			'muriel-grid-item': item,
			'muriel-grid-zeroMinWidth': zeroMinWidth,
			[ `muriel-grid-direction-xs-${ String( direction ) }` ]:
				direction !== Grid.defaultProps.direction,
			[ `muriel-grid-wrap-${ String( wrap ) }` ]: wrap !== Grid.defaultProps.wrap,
			[ `muriel-grid-align-items-${ String( alignItems ) }` ]:
				alignItems !== Grid.defaultProps.alignItems,
			[ `muriel-grid-align-content-${ String( alignContent ) }` ]:
				alignContent !== Grid.defaultProps.alignContent,
			[ `muriel-grid-justify-${ String( justify ) }` ]: justify !== Grid.defaultProps.justify,
			[ `muriel-grid-xs-${ String( xs ) }` ]: xs !== false,
			[ `muriel-grid-sm-${ String( sm ) }` ]: sm !== false,
			[ `muriel-grid-md-${ String( md ) }` ]: md !== false,
			[ `muriel-grid-lg-${ String( lg ) }` ]: lg !== false,
			[ `muriel-grid-xl-${ String( xl ) }` ]: xl !== false,
		},
		classNameProp
	);

	return <Component className={ classname } { ...other } />;
}

Grid.propTypes = {
	/**
	 * Defines the `align-content` style property.
	 * It's applied for all screen sizes.
	 */
	alignContent: PropTypes.oneOf( [
		'stretch',
		'center',
		'flex-start',
		'flex-end',
		'space-between',
		'space-around',
	] ),
	/**
	 * Defines the `align-items` style property.
	 * It's applied for all screen sizes.
	 */
	alignItems: PropTypes.oneOf( [ 'flex-start', 'center', 'flex-end', 'stretch', 'baseline' ] ),
	/**
	 * The content of the component.
	 */
	children: PropTypes.node,
	/**
	 * Override or extend the styles applied to the component.
	 * See [CSS API](#css-api) below for more details.
	 */
	classes: PropTypes.object.isRequired,
	/**
	 * @ignore
	 */
	className: PropTypes.string,
	/**
	 * The component used for the root node.
	 * Either a string to use a DOM element or a component.
	 */
	component: PropTypes.oneOfType( [ PropTypes.string, PropTypes.node ] ),
	/**
	 * If `true`, the component will have the flex *container* behavior.
	 * You should be wrapping *items* with a *container*.
	 */
	container: PropTypes.bool,
	/**
	 * Defines the `flex-direction` style property.
	 * It is applied for all screen sizes.
	 */
	direction: PropTypes.oneOf( [ 'row', 'row-reverse', 'column', 'column-reverse' ] ),
	/**
	 * If `true`, the component will have the flex *item* behavior.
	 * You should be wrapping *items* with a *container*.
	 */
	item: PropTypes.bool,
	/**
	 * Defines the `justify-content` style property.
	 * It is applied for all screen sizes.
	 */
	justify: PropTypes.oneOf( [
		'flex-start',
		'center',
		'flex-end',
		'space-between',
		'space-around',
		'space-evenly',
	] ),
	/**
	 * Defines the number of grids the component is going to use.
	 * It's applied for the `lg` breakpoint and wider screens if not overridden.
	 */
	lg: PropTypes.oneOf( [ false, ...GRID_SIZES ] ),
	/**
	 * Defines the number of grids the component is going to use.
	 * It's applied for the `md` breakpoint and wider screens if not overridden.
	 */
	md: PropTypes.oneOf( [ false, ...GRID_SIZES ] ),
	/**
	 * Defines the number of grids the component is going to use.
	 * It's applied for the `sm` breakpoint and wider screens if not overridden.
	 */
	sm: PropTypes.oneOf( [ false, ...GRID_SIZES ] ),
	/**
	 * Defines the `flex-wrap` style property.
	 * It's applied for all screen sizes.
	 */
	wrap: PropTypes.oneOf( [ 'nowrap', 'wrap', 'wrap-reverse' ] ),
	/**
	 * Defines the number of grids the component is going to use.
	 * It's applied for the `xl` breakpoint and wider screens.
	 */
	xl: PropTypes.oneOf( [ false, ...GRID_SIZES ] ),
	/**
	 * Defines the number of grids the component is going to use.
	 * It's applied for all the screen sizes with the lowest priority.
	 */
	xs: PropTypes.oneOf( [ false, ...GRID_SIZES ] ),
	/**
	 * If `true`, it sets `min-width: 0` on the item.
	 * Refer to the limitations section of the documentation to better understand the use case.
	 */
	zeroMinWidth: PropTypes.bool,
};

Grid.defaultProps = {
	alignContent: 'stretch',
	alignItems: 'stretch',
	component: 'div',
	classes: {},
	container: false,
	direction: 'row',
	item: false,
	justify: 'flex-start',
	lg: false,
	md: false,
	sm: false,
	wrap: 'wrap',
	xl: false,
	xs: false,
	zeroMinWidth: false,
};

export default Grid;
