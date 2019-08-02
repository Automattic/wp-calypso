/**
 * External dependencies
 */
import { PlainText } from '@wordpress/editor';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ENTER } from '@wordpress/keycodes';

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
	insertDefaultBlock,
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

	const onKeyDown = event => {
		if ( event.keyCode !== ENTER ) {
			return;
		}
		event.preventDefault();
		insertDefaultBlock();
	};

	return (
		<Fragment>
			<PlainText
				className={ className }
				value={ option }
				onChange={ value => handleChange( value ) }
				onKeyDown={ onKeyDown }
				placeholder={ __( 'Site Description' ) }
				aria-label={ __( 'Site Description' ) }
			/>
		</Fragment>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const { isSavingPost, isPublishingPost, isAutosavingPost, isCurrentPostPublished } = select(
			'core/editor'
		);
		const { getBlockIndex, getBlockRootClientId } = select( 'core/block-editor' );
		const rootClientId = getBlockRootClientId( clientId );
		const blockIndex = getBlockIndex( clientId, rootClientId );

		return {
			blockIndex,
			rootClientId,
			shouldUpdateSiteOption:
				( ( isSavingPost() && isCurrentPostPublished() ) || isPublishingPost() ) &&
				! isAutosavingPost(),
		};
	} ),
	withDispatch( ( dispatch, { blockIndex, rootClientId } ) => ( {
		createErrorNotice: dispatch( 'core/notices' ).createErrorNotice,
		insertDefaultBlock: () =>
			dispatch( 'core/block-editor' ).insertDefaultBlock( {}, rootClientId, blockIndex + 1 ),
	} ) ),
] )( SiteDescriptionEdit );
