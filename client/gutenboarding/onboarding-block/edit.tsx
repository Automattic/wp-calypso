/**
 * External dependencies
 */
import { sprintf, __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { BlockEditProps } from '@wordpress/blocks';
import React from 'react';

/**
 * Internal dependencies
 */
import { Attributes, SiteType } from '.';

export default function OnboardingEdit( {
	attributes: { siteType },
	setAttributes,
}: BlockEditProps< Attributes > ) {
	if ( ! siteType ) {
		return (
			<>
				<h1>{ __( "Let's set up your website -- it takes only a moment" ) }</h1>
				{ __( 'I want to create a website ' ) }
				<SelectControl< SiteType >
					onChange={ v => setAttributes( { siteType: v } ) }
					options={ [
						{ label: __( 'with a blog.' ), value: 'blog' },
						{ label: __( 'for a store.' ), value: 'store' },
						{ label: __( 'to write a story.' ), value: 'story' },
					] }
					value={ siteType || SiteType.BLOG }
				/>
			</>
		);
	}
	return sprintf( __( 'Cool, you have a %s' ), siteType );
}
