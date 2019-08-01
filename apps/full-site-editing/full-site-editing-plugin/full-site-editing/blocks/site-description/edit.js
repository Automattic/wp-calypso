/**
 * External dependencies
 */
import { RichText } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteDescriptionEdit( {
	className,
	createErrorNotice,
	shouldUpdateSiteOption,
	isSelected,
	setAttributes,
} ) {
	const inititalDescription = __( 'Site description loading…' );

	const { siteOptions, handleChange } = useSiteOptions(
		'description',
		inititalDescription,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	return (
		<Fragment>
			<RichText
				className={ className }
				value={ option }
				tagName="p"
				formattingControls={ [] }
				onChange={ value => handleChange( value ) }
				placeholder={ __( 'Site Description' ) }
				aria-label={ __( 'Site Description' ) }
			/>
		</Fragment>
	);
}

export default compose( [
	withDispatch( dispatch => ( {
		createErrorNotice: dispatch( 'core/notices' ).createErrorNotice,
	} ) ),
	withSelect( select => {
		const { isSavingPost, isPublishingPost, isAutosavingPost, isCurrentPostPublished } = select(
			'core/editor'
		);
		return {
			shouldUpdateSiteOption:
				( ( isSavingPost() && isCurrentPostPublished() ) || isPublishingPost() ) &&
				! isAutosavingPost(),
		};
	} ),
] )( SiteDescriptionEdit );
