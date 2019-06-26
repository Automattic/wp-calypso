/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { Button } from '@wordpress/components';
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
} ) {
	const inititalDescription = __( 'Site description loading…' );

	const { onSave, siteOptions, setSiteOptions } = useSiteOptions(
		'description',
		inititalDescription,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption
	);

	const { option, isDirty, isSaving } = siteOptions;

	return (
		<Fragment>
			<PlainText
				className={ className }
				value={ option }
				onChange={ value => setSiteOptions( { ...siteOptions, option: value, isDirty: true } ) }
				placeholder={ __( 'Site Description' ) }
				aria-label={ __( 'Site Description' ) }
			/>
			{ isDirty && (
				<Button
					isLarge
					className="site-description__save-button"
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
] )( SiteDescriptionEdit );
