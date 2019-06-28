/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { withNotices } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteDescriptionEdit( {
	className,
	noticeUI,
	noticeOperations,
	shouldUpdateSiteOption,
	isSelected,
	setAttributes,
} ) {
	const inititalDescription = __( 'Site description loading…' );

	const { siteOptions, handleChange } = useSiteOptions(
		'description',
		inititalDescription,
		noticeOperations,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	return (
		<Fragment>
			{ noticeUI }
			<PlainText
				className={ className }
				value={ option }
				onChange={ value => handleChange( value ) }
				placeholder={ __( 'Site Description' ) }
				aria-label={ __( 'Site Description' ) }
			/>
		</Fragment>
	);
}

export default compose( [
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
	withNotices,
] )( SiteDescriptionEdit );
