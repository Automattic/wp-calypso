/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import React from 'react';

export default function OnboardingEdit() {
	return (
		<>
			<h1>{ __( "Let's set up your website -- it takes only a moment" ) }</h1>
			<p>{ __( 'I want to create' ) }</p>
		</>
	);
}
