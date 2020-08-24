/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { createHigherOrderComponent, pure } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSiteOptions } from './use-site-options';

/**
 * Higher Order Component used to inject site options.
 *
 * The option value is requested from the WordPress API. Note that arbitrary
 * options can only be retrieved if they have been registered as site settings.
 *
 * Updates are persisted to the database when the post is saved.
 *
 * In the component, every specified `optionName` will be a prop which maps to
 * an object with the keys `value`, `updateValue`, and `loaded`. `value`
 * contains the actual value of the WordPress option, and `updateValue` can be
 * used to update the option. `updateValue` will re-render the component with
 * the new `value`.
 *
 * @param {object} options An object of site options to retrieve. Keys should be
 *                         option names you wish to have locally. They can be
 *                         named whatever makes sense in the context of your
 *                         component. Any key's value should be another object
 *                         whih contains `optionName`, the actual name of the
 *                         WordPress option to fetch, and `defaultValue`, the
 *                         value to use while the option is fetching.
 *
 * @returns {Component} The higher order component.
 *
 * In the following example, withSiteOptions is called with an object mapping a
 * name for the option to some information about it. In particular, optionName
 * needs to match the name of the option in WordPress, and defaultValue is used
 * while the option is loading from the API.
 *
 * @example
 * function Component( { mySiteOption } ) {
 *   const { value, updateValue } = mySiteOption;
 *   // `updateValue( 'foo' )` the component will re-render if called.
 *   return <span>{ value }</span>;
 * }
 *
 * export default compose( [
 *   withSiteOptions( {
 *     mySiteOption: { optionName: 'title', defaultValue: __( 'Site title loading…' ) },
 * 	} ),
 * ] )( Component );
 *
 */
export const withSiteOptions = ( options ) =>
	createHigherOrderComponent(
		( WrappedComponent ) =>
			pure( ( ownProps ) => {
				const shouldUpdateSiteOption = useSelect( ( select ) => {
					const {
						isSavingPost,
						isPublishingPost,
						isAutosavingPost,
						isCurrentPostPublished,
					} = select( 'core/editor' );
					return (
						( ( isSavingPost() && isCurrentPostPublished() ) || isPublishingPost() ) &&
						! isAutosavingPost()
					);
				} );

				const createErrorNotice = useDispatch(
					( dispatch ) => dispatch( 'core/notices' ).createErrorNotice
				);

				const { isSelected, setAttributes } = ownProps;
				const allOptions = Object.keys( options ).reduce( ( accumulator, name ) => {
					const { optionName, defaultValue } = options[ name ];
					const { siteOptions, handleChange } = useSiteOptions(
						optionName,
						defaultValue,
						createErrorNotice,
						isSelected,
						shouldUpdateSiteOption,
						setAttributes
					);
					accumulator[ name ] = {
						value: siteOptions.option,
						updateValue: handleChange,
						loaded: siteOptions.loaded,
					};
					return accumulator;
				}, {} );

				return <WrappedComponent { ...ownProps } { ...allOptions } />;
			} ),
		'withSiteOptions'
	);
