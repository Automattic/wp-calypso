/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { TextControl, SelectControl } from '@wordpress/components';
import React from 'react';

/**
 * Internal dependencies
 */
import { SiteType } from '../store/types';
import { useOnboardingDispatch, useOnboardingState } from '../store';

export default function OnboardingEdit() {
	const { siteTitle, siteType } = useOnboardingState();
	const { setSiteType, setSiteTitle } = useOnboardingDispatch();

	return (
		<>
			<p>{ __( "Let's set up your website -- it takes only a moment" ) }</p>
			{ __( 'I want to create a website ' ) }
			<SelectControl< SiteType >
				onChange={ setSiteType }
				options={ [
					{ label: __( 'with a blog.' ), value: SiteType.BLOG },
					{ label: __( 'for a store.' ), value: SiteType.STORE },
					{ label: __( 'to write a story.' ), value: SiteType.STORY },
				] }
				value={ siteType }
			/>
			{ ( siteType || siteTitle ) && (
				<>
					<p>{ __( "It's called" ) }</p>
					<TextControl onChange={ setSiteTitle } value={ siteTitle } />
				</>
			) }
		</>
	);
}
