/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { isEmpty, map } from 'lodash';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
/**
 * Internal dependencies
 */
import { SiteType, isFilledFormValue } from '../store/types';
import { STORE_KEY } from '../store';
import VerticalSelect from './vertical-select';
import './style.scss';

const siteTypeOptions: Record< SiteType, string > = {
	[ SiteType.BLOG ]: NO__( 'with a blog.' ),
	[ SiteType.STORE ]: NO__( 'for a store.' ),
	[ SiteType.STORY ]: NO__( 'to write a story.' ),
};

export default function OnboardingEdit() {
	const [ lastSelectedQuestion, setLastSelectedQuestion ] = useState( null );

	const { siteTitle, siteType, siteVertical } = useSelect( select =>
		select( STORE_KEY ).getState()
	);

	const { setSiteType, setSiteTitle } = useDispatch( STORE_KEY );

	const updateTitle = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteTitle( e.target.value ),
		[ setSiteTitle ]
	);

	const updateSiteType = useCallback(
		( e: React.ChangeEvent< HTMLInputElement > ) => setSiteType( e.target.value as SiteType ),
		[ setSiteType ]
	);

	const selectSiteType = e => {
		updateSiteType( e );
		setLastSelectedQuestion( null );
	};

	const openSiteType = () => {
		setLastSelectedQuestion( 'siteType' );
	};

	const selectSiteVertical = () => {
		setLastSelectedQuestion( 'siteVertical' );
	};

	const selectSiteTitle = () => {
		setLastSelectedQuestion( 'siteTitle' );
	};

	const isSelected = questionType => {
		if ( lastSelectedQuestion ) {
			return questionType === lastSelectedQuestion;
		} else if ( isEmpty( siteType ) ) {
			return questionType === 'siteType';
		} else if ( isEmpty( siteVertical ) ) {
			return questionType === 'siteVertical';
		} else if ( questionType === 'siteTitle' ) {
			return true;
		}
		return false;
	};

	return (
		<div className="onboarding-block__acquire-intent">
			<div className="onboarding-block__questions">
				<h2 className="onboarding-block__questions-heading">
					{ isEmpty( siteType ) && NO__( "Let's set up your website – it takes only a moment." ) }
				</h2>

				<div
					className={ classNames( {
						'onboarding-block__question': true,
						selected: isSelected( 'siteType' ),
					} ) }
				>
					<span>
						{ isEmpty( siteType )
							? NO__( 'I want to create a website ' )
							: NO__( 'Setting up a website ' ) }
					</span>
					{ isSelected( 'siteType' ) ? (
						<ul className="onboarding-block__multi-question">
							{ map( siteTypeOptions, ( label, value ) => (
								<li key={ value } className={ value === siteType ? 'selected' : null }>
									<label>
										<input
											name="onboarding_site_type"
											onChange={ selectSiteType }
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
							<button className="onboarding-block__question-answered" onClick={ openSiteType }>
								{ siteTypeOptions[ siteType ] }
							</button>
						</div>
					) }
				</div>

				{ ( isFilledFormValue( siteType ) || ! isEmpty( siteVertical ) ) && (
					<div
						className={ classNames( {
							'onboarding-block__question': true,
							selected: isSelected( 'siteVertical' ),
						} ) }
					>
						<span>{ NO__( 'My site is about' ) }</span>
						<div className="onboarding-block__multi-question">
							<VerticalSelect
								onClick={ selectSiteVertical }
								forceHideSuggestions={ ! isSelected( 'siteVertical' ) }
								inputClass="onboarding-block__question-input"
							/>
						</div>
					</div>
				) }

				{ ( ! isEmpty( siteVertical ) || siteTitle ) && (
					<div
						className={ classNames( {
							'onboarding-block__question': true,
							selected: isSelected( 'siteTitle' ),
						} ) }
					>
						<label>
							<span>{ NO__( "It's called" ) }</span>
							<input
								className="onboarding-block__question-input bbb"
								onClick={ selectSiteTitle }
								onChange={ updateTitle }
								value={ siteTitle }
							/>
						</label>
					</div>
				) }

				{ ! isEmpty( siteVertical ) && (
					<div className="onboarding-block__footer">
						<Button className="onboarding-block__question-skip" isLink>
							{ NO__( "Don't know yet" ) } →
						</Button>
					</div>
				) }
			</div>
		</div>
	);
}
