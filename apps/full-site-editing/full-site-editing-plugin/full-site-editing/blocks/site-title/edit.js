/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { PlainText } from '@wordpress/editor';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteTitleEdit( { className, createErrorNotice, shouldUpdateSiteOption, isSelected } ) {
	const inititalTitle = __( 'Site title loading…' );
	const { onSave, siteOptions, setSiteOptions } = useSiteOptions(
		'title',
		inititalTitle,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption
	);

	const { option, isDirty, isSaving } = siteOptions;

	return (
		<Fragment>
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
