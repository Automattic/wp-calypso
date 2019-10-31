/* eslint-disable wpcalypso/jsx-classname-namespace */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { AlignmentToolbar, BlockControls } from '@wordpress/block-editor';
import { SelectControl } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useSiteOptions from '../useSiteOptions';
import { RenderedCreditChoice, creditOptions } from './footerCreditChoices';

function SiteCreditEdit( {
	attributes,
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

	const { textAlign = 'center' } = attributes;

	return (
		<Fragment>
			<BlockControls>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ nextAlign => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			<div
				className={ classNames( 'site-info', 'site-credit__block', {
					[ `has-text-align-${ textAlign }` ]: textAlign,
				} ) }
			>
				<span className="site-name">{ siteTitle }</span>
				<span className="comma">,</span>
				<span className="site-credit__selection">
					{ isSelected ? (
						<SelectControl onChange={ updateCredit } value={ wpCredit } options={ creditOptions } />
					) : (
						<RenderedCreditChoice choice={ wpCredit } />
					) }
				</span>
			</div>
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
