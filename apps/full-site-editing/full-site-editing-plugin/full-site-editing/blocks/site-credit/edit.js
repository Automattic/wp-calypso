/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

function SiteCreditEdit( {
	createErrorNotice,
	isSelected,
	setAttributes,
	shouldUpdateSiteOption,
} ) {
	const inititalDescription = __( 'Site credit loading…' );

	const { siteOptions } = useSiteOptions(
		'title',
		inititalDescription,
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const { option } = siteOptions;

	return (
		<Fragment>
			<span class="site-name">{ option }</span>
			<span class="comma">,</span>
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

		return {
			blockIndex: getBlockIndex( clientId, rootClientId ),
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
] )( SiteCreditEdit );
