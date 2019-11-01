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
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { withSiteOptions } from '../../lib';
import { RenderedCreditChoice, creditOptions } from './footerCreditChoices';

function SiteCreditEdit( {
	attributes: { textAlign = 'center' },
	isSelected,
	setAttributes,
	footerCreditOption: { value: wpCredit, updateValue: updateCredit },
	siteTitleOption: { value: siteTitle },
} ) {
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
	withSiteOptions( {
		siteTitleOption: { optionName: 'title', defaultValue: __( 'Site title loading…' ) },
		footerCreditOption: {
			optionName: 'footer_credit',
			defaultValue: __( 'Footer credit loading…' ),
		},
	} ),
] )( SiteCreditEdit );
