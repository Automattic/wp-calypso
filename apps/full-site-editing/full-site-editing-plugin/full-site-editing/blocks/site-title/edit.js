/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { withNotices, Button } from '@wordpress/components';
import { PlainText } from '@wordpress/editor';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteTitleEdit( {
	className,
	noticeUI,
	noticeOperations,
	shouldUpdateSiteOption,
	isSelected,
} ) {
	const defaultTitle = __( 'Site title loading…' );
	const { onSave, siteOptions, setSiteOptions } = useSiteOptions(
		'title',
		defaultTitle,
		noticeOperations,
		isSelected,
		shouldUpdateSiteOption
	);

	const { option, isDirty, isSaving } = siteOptions;

	return (
		<Fragment>
			{ noticeUI }
			<PlainText
				className={ classNames( 'site-title', className ) }
				value={ option }
				onChange={ value => setSiteOptions( { ...siteOptions, option: value, isDirty: true } ) }
				placeholder={ __( 'Site Title' ) }
				aria-label={ __( 'Site Title' ) }
			/>
			{ isDirty && (
				<Button
					isLarge
					className="site-title__save-button"
					disabled={ isSaving }
					isBusy={ isSaving }
					onClick={ onSave }
				>
					{ __( 'Save' ) }
				</Button>
			) }
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
] )( SiteTitleEdit );
