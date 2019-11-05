/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, FormTokenField } from '@wordpress/components';
import { map } from 'lodash';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useCallback, useState } from 'react';

/**
 * Internal dependencies
 */
import { SiteType, EMPTY_FORM_VALUE } from '../store/types';
import { STORE_KEY } from '../store';
import './style.scss';

const siteTypeOptions: Record< SiteType, string > = {
	[ SiteType.BLOG ]: NO__( 'with a blog.' ),
	[ SiteType.STORE ]: NO__( 'for a store.' ),
	[ SiteType.STORY ]: NO__( 'to write a story.' ),
};

export default function OnboardingEdit() {
	const [ verticalId, setVerticalId ] = useState< string >();

	const { siteTitle, siteType } = useSelect( select => select( STORE_KEY ).getState() );

	// This is a difficult section for working with FormToken field. Not ideal for our use case.
	const [ verticalLabels, verticalLabelToId ] = useSelect( select => {
		const vs = select( STORE_KEY ).getVerticals();
		if ( ! vs ) {
			return [ [], {} ];
		}
		return vs.reduce< [ string[], Record< string, string > ] >(
			( [ labels, labelToId ], v ) => [
				labels.concat( v.vertical_name ),
				Object.assign( labelToId, { [ v.vertical_name ]: v.vertical_id } ),
			],
			[ [], {} ]
		);
	} );
	const verticalLabel = useSelect(
		select => {
			if ( ! verticalId ) {
				return [];
			}
			const v = select( STORE_KEY ).getVerticalItem( verticalId );
			return v ? [ v.vertical_name ] : [];
		},
		[ verticalId ]
	);
	const updateVerticalId = useCallback(
		( [ nextLabel ] ) => setVerticalId( verticalLabelToId[ nextLabel ] ),
		[ setVerticalId, verticalLabels, verticalLabelToId ]
	);
	// END: FormTokenField difficult section

	const { resetSiteType, setSiteType, setSiteTitle } = useDispatch( STORE_KEY );

	const updateTitle = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteTitle( e.target.value ),
		[ setSiteTitle ]
	);
	const updateSiteType = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteType( e.target.value as SiteType ),
		[ setSiteType ]
	);

	return (
		<div className="onboarding-block__questions">
			<h2 className="onboarding-block__questions-heading">
				{ NO__( "Let's set up your website – it takes only a moment." ) }
			</h2>

			<div className="onboarding-block__question">
				<span>{ NO__( 'I want to create a website ' ) }</span>
				{ siteType === EMPTY_FORM_VALUE ? (
					<ul className="onboarding-block__multi-question">
						{ map( siteTypeOptions, ( label, value ) => (
							<li key={ value }>
								<label>
									<input
										checked={ siteType === value }
										name="onboarding_site_type"
										onChange={ updateSiteType }
										type="radio"
										value={ value }
									/>
									<span className="onboarding-block__multi-question-choice">{ label }</span>
								</label>
							</li>
						) ) }
					</ul>
				) : (
					<div className="onboarding-block__multi-question">
						<button className="onboarding-block__question-answered" onClick={ resetSiteType }>
							{ siteTypeOptions[ siteType ] }
						</button>
					</div>
				) }
			</div>
			{ /* FormTokenField sufficient for first round, but not ideal. Simpler component for single autocomplete is needed */ }
			{ ( siteType !== EMPTY_FORM_VALUE || verticalLabel.length ) && (
				<FormTokenField
					label={ NO__( 'My site is about' ) }
					maxLength={ 1 }
					onChange={ updateVerticalId }
					suggestions={ verticalLabels }
					value={ verticalLabel }
				/>
			) }
			{ ( verticalLabel.length || siteTitle ) && (
				<>
					<label className="onboarding-block__question">
						<span>{ NO__( "It's called" ) }</span>
						<input
							className="onboarding-block__question-input"
							onChange={ updateTitle }
							value={ siteTitle }
						/>
					</label>
					{ ! siteTitle && (
						<Button className="onboarding-block__question-skip" isLink>
							{ NO__( "Don't know yet" ) } →
						</Button>
					) }
				</>
			) }
		</div>
	);
}
