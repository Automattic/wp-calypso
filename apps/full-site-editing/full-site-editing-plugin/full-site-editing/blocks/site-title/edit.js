/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PlainText } from '@wordpress/editor';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteTitleEdit( {
	className,
	createErrorNotice,
	shouldUpdateSiteOption,
	isSelected,
	setAttributes,
} ) {
	const inititalTitle = __( 'Site title loading…' );
	const { siteOptions, handleChange } = useSiteOptions(
		'title',
		inititalTitle,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	return (
		<Fragment>
			<PlainText
				className={ classNames( 'site-title', className ) }
				value={ option }
				onChange={ value => handleChange( value ) }
				placeholder={ __( 'Site Title' ) }
				aria-label={ __( 'Site Title' ) }
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
] )( SiteTitleEdit );
