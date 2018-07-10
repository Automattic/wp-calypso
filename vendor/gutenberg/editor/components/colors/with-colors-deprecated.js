/**
 * External dependencies
 */
import memoize from 'memize';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent, Component, compose } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { getColorValue, getColorClass, setColorValue } from './utils';

const DEFAULT_COLORS = [];

/**
 * Higher-order component, which handles color logic for class generation
 * color value, retrieval and color attribute setting.
 *
 * @param {Function} mapGetSetColorToProps Function that receives getColor, setColor, and props,
 *                                         and returns additional props to pass to the component.
 *
 * @return {Function} Higher-order component.
 */
export default ( mapGetSetColorToProps ) => createHigherOrderComponent(
	compose( [
		withSelect(
			( select ) => {
				const settings = select( 'core/editor' ).getEditorSettings();
				return {
					colors: get( settings, [ 'colors' ], DEFAULT_COLORS ),
				};
			} ),
		( WrappedComponent ) => {
			return class extends Component {
				constructor() {
					super( ...arguments );
					/**
					* Even though we don't expect setAttributes or colors to change memoizing it is essential.
					* If setAttributes or colors are not memoized, each time memoizedGetColor/memoizedSetColor are called:
					* a new function reference is returned (even if arguments have not changed).
					* This would make our memoized chain useless.
					*/
					this.memoizedGetColor = memoize( this.memoizedGetColor, { maxSize: 1 } );
					this.memoizedSetColor = memoize( this.memoizedSetColor, { maxSize: 1 } );
				}

				memoizedGetColor( colors ) {
					return memoize(
						( colorName, customColorValue, colorContext ) => {
							return {
								name: colorName,
								class: getColorClass( colorContext, colorName ),
								value: getColorValue( colors, colorName, customColorValue ),
							};
						}
					);
				}

				memoizedSetColor( setAttributes, colors ) {
					return memoize(
						( colorNameAttribute, customColorAttribute ) => {
							return setColorValue( colors, colorNameAttribute, customColorAttribute, setAttributes );
						}
					);
				}

				render() {
					return (
						<WrappedComponent
							{ ...{
								...this.props,
								colors: undefined,
								...mapGetSetColorToProps(
									this.memoizedGetColor( this.props.colors ),
									this.memoizedSetColor( this.props.setAttributes, this.props.colors ),
									this.props
								),
							} }
						/>
					);
				}
			};
		},
	] ),
	'withColors'
);
