/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockSaveProps } from '@wordpress/blocks';
import React from 'react';

/**
 * Internal dependencies
 */
import { Attributes } from '.';

export default function OnboardingEdit( {
	attributes: { siteType },
}: BlockSaveProps< Attributes > ) {
	if ( ! siteType ) {
		return (
			<>
				<h1>{ __( "Let's set up your website -- it takes only a moment" ) }</h1>
				<p>{ __( 'I want to create a website' ) }</p>
			</>
		);
	}
	return null;
}
