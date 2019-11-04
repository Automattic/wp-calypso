/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { map } from 'lodash';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useCallback } from 'react';

/**
 * Internal dependencies
 */
import { SiteType, UNKNOWN_FORM_VALUE } from '../store/types';
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
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteType( e.target.value as SiteType ),
		[ setSiteType ]
	);
	const siteTypeOptions = {
		[ SiteType.BLOG ]: NO__( 'with a blog.' ),
		[ SiteType.STORE ]: NO__( 'for a store.' ),
		[ SiteType.STORY ]: NO__( 'to write a story.' ),
	};

	const handleResetSiteType = useCallback( () => setSiteType( UNKNOWN_FORM_VALUE ), [
		setSiteType,
	] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="onboarding__questions">
			<h2 className="onboarding__questions-heading">
				{ NO__( "Let's set up your website – it takes only a moment." ) }
			</h2>

			<div className="onboarding__question">
				<span>{ NO__( 'I want to create a website ' ) }</span>

				{ siteType === UNKNOWN_FORM_VALUE && (
					<ul className="onboarding__multi-question">
						{ map( siteTypeOptions, ( label, value ) => (
							<li key={ value }>
								<label>
									<input
										checked={ siteType === value }
										name="onboarding_site_type"
										onChange={ handleSiteTypeChange }
										type="radio"
										value={ value }
									/>
									<span className="onboarding__multi-question-choice">{ label }</span>
								</label>
							</li>
						) ) }
					</ul>
				) }
				{ siteType !== UNKNOWN_FORM_VALUE && (
					<div className="onboarding__multi-question">
						<button className="onboarding__question-answered" onClick={ handleResetSiteType }>
							{ siteTypeOptions[ siteType ] }
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
