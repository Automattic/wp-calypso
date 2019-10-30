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

// @TODO: These should probably be defined elsewhere
const creditOptions = [
	{ label: 'Proudly powered by WordPress', value: 'default' },
	{ label: 'WordPress Logo', value: 'svg' },
];

function SiteCreditEdit( {
	createErrorNotice,
	isSelected,
	setAttributes,
	shouldUpdateSiteOption,
} ) {
	// @TODO: Refactor createErrorNotice, shouldUpdateSiteOption, isSelected, and setAttributes into useSiteOptions.
	const {
		siteOptions: { option: siteTitle },
	} = useSiteOptions(
		'title',
		__( 'Site title loading…' ),
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	const {
		siteOptions: { option: wpCredit },
		handleChange: updateCredit,
	} = useSiteOptions(
		'footer_credit',
		__( 'Footer credit loading…' ),
		createErrorNotice,
		isSelected,
		shouldUpdateSiteOption,
		setAttributes
	);

	return (
		<div className="site-info footer-credit-block">
			<span className="site-name">{ siteTitle }</span>
			<span className="comma">,</span>
			<SelectControl
				className="credit-selector"
				onChange={ updateCredit }
				value={ wpCredit }
				options={ creditOptions }
			/>
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
