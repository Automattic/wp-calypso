/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * WordPress dependencies
 */
import { compose, withState } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';

// @TODO: These should probably come from the existing set of options on the backend.
// They already have translation variations which could be incorporated here.
const creditOptions = [
	{ label: 'WordPress.com', value: 'com' },
	{ label: 'WordPress.com Logo', value: 'svg' },
	{ label: 'A WordPress.com Website', value: 'acom' },
	{ label: 'Blog at WordPress.com', value: 'blog' },
	{ label: 'Powered by WordPress.com', value: 'powered' },
];

function SiteCreditEdit( {
	createErrorNotice,
	isSelected,
	setAttributes,
	shouldUpdateSiteOption,
	creditOption,
	setState,
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

	const setOption = newOption => setState( { creditOption: newOption } );

	return (
		<div className="site-info">
			<span className="site-name">{ option }</span>
			<span className="comma">,</span>
			<SelectControl onChange={ setOption } value={ creditOption } options={ creditOptions } />
		</div>
	);
}

export default compose( [
	withState( { creditOption: 'acom' } ),
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
