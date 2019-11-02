/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useCallback } from 'react';

/**
 * Internal dependencies
 */
import { SiteType } from '../store/types';
import { STORE_KEY } from '../store';
import './style.scss';

export default function OnboardingEdit() {
	const { siteTitle, siteType } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteType, setSiteTitle } = useDispatch( STORE_KEY );
	const handleTitleChange = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteTitle( e.target.value ),
		[ setSiteTitle ]
	);

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="onboarding__questions">
			<h2 className="onboarding__questions-heading">
				{ NO__( "Let's set up your website – it takes only a moment." ) }
			</h2>

			<label className="onboarding__question">
				<span>{ NO__( 'I want to create a website ' ) }</span>
				<SelectControl< SiteType >
					onChange={ setSiteType }
					options={ [
						{ label: NO__( 'with a blog.' ), value: SiteType.BLOG },
						{ label: NO__( 'for a store.' ), value: SiteType.STORE },
						{ label: NO__( 'to write a story.' ), value: SiteType.STORY },
					] }
					value={ siteType }
					className="onboarding__question-input"
				/>
			</label>
			{ ( siteType || siteTitle ) && (
				<label className="onboarding__question">
					<span>{ NO__( "It's called" ) }</span>
					<input
						className="onboarding__question-input"
						onChange={ handleTitleChange }
						value={ siteTitle }
					/>
				</label>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
