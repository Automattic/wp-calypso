/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { createHigherOrderComponent, pure } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSiteOptions } from './useSiteOptions';

export const withSiteOptions = options =>
	createHigherOrderComponent(
		WrappedComponent =>
			pure( ownProps => {
				const shouldUpdateSiteOption = useSelect( select => {
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
					dispatch => dispatch( 'core/notices' ).createErrorNotice
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
