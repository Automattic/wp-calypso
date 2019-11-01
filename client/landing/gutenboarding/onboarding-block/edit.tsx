/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
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
	const handleSiteTypeChange = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteType( e.target.value ),
		[ setSiteType ]
	);
	const siteTypeOptions = [
		{ label: NO__( 'with a blog.' ), value: SiteType.BLOG },
		{ label: NO__( 'for a store.' ), value: SiteType.STORE },
		{ label: NO__( 'to write a story.' ), value: SiteType.STORY },
	];
	const handleResetSiteType = useCallback( () => setSiteType( '' ), [ setSiteType ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="onboarding__questions">
			<h2 className="onboarding__questions-heading">
				{ NO__( "Let's set up your website – it takes only a moment." ) }
			</h2>

			<div className="onboarding__question">
				<span>{ NO__( 'I want to create a website ' ) }</span>

				{ ! siteType && (
					<ul className="onboarding__multi-question">
						{ siteTypeOptions.map( siteTypeOption => (
							<li key={ siteTypeOption.value }>
								<label>
									<input
										checked={ siteType === siteTypeOption.value }
										name="onboarding_site_type"
										onChange={ handleSiteTypeChange }
										type="radio"
										value={ siteTypeOption.value }
									/>
									<span className="onboarding__multi-question-choice">
										{ siteTypeOption.label }
									</span>
								</label>
							</li>
						) ) }
					</ul>
				) }
				{ siteType && (
					<div className="onboarding__multi-question">
						<button className="onboarding__question-answered" onClick={ handleResetSiteType }>
							{ siteType }
						</button>
					</div>
				) }
			</div>
			{ ( siteType || siteTitle ) && (
				<>
					<label className="onboarding__question">
						<span>{ NO__( "It's called" ) }</span>
						<input
							className="onboarding__question-input"
							onChange={ handleTitleChange }
							value={ siteTitle }
						/>
					</label>
					{ ! siteTitle && (
						<Button className="onboarding__question-skip" isLink>
							{ NO__( "Don't know yet" ) } →
						</Button>
					) }
				</>
			) }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
