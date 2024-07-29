import { FormInputValidation, Gridicon } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { CSSProperties, useEffect, useRef } from 'react';
import FormRadioWithThumbnail from 'calypso/components/forms/form-radio-with-thumbnail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { ONBOARD_STORE } from '../../../../stores';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { Title, Label, Input, Hint } from './components';
import type { OnboardSelect } from '@automattic/data-stores';
import type { StyleVariation } from 'calypso/../packages/design-picker/src/types';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import './style.scss';

type ThemeStyle = {
	name: string;
	title: string;
};

const styles: ThemeStyle[] = [
	{ name: 'green', title: 'Green' },
	{ name: 'blue', title: 'Blue' },
	{ name: 'dark', title: 'Dark' },
	{ name: 'gold', title: 'Gold' },
];

const ThemeStylePreviews = ( {
	styles,
	active,
}: {
	styles: ThemeStyle[];
	active: string;
	siteTitle?: string;
} ) => {
	const index = 1 + styles.findIndex( ( style ) => active === style.name );
	return (
		<div className="sensei-theme-previews">
			<div className="sensei-theme-list" style={ { '--index': index } as CSSProperties }>
				{ styles.map( ( { name } ) => {
					return (
						<div
							key={ name }
							className={ clsx( 'sensei-theme-item', { selected: name === active } ) }
						>
							<div className={ `sensei-theme ${ name }` }></div>
						</div>
					);
				} ) }
			</div>
		</div>
	);
};

const SenseiSetup: Step = ( { navigation } ) => {
	const { __ } = useI18n();
	const isDesktop = useDesktopBreakpoint();
	const inputRef = useRef< HTMLInputElement >( null );

	const initialSiteTitle = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
		[]
	);
	const [ siteTitle, setSiteTitle ] = useState< string >( initialSiteTitle );
	const [ checked, setChecked ] = useState< string >( 'green' );
	const [ hasSubmitted, setHasSubmitted ] = useState< boolean >( false );

	const handleChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		setChecked?.( event.target.value );
	};

	const { submit } = navigation;
	const dispatch = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		dispatch.resetOnboardStore();
	}, [ dispatch ] );

	const focusOnSiteTitleInput = () => {
		// Focus on the input when the step is mounted.
		if ( inputRef.current ) {
			inputRef.current.focus();
		}
	};

	const handleSubmit = useCallback( () => {
		setHasSubmitted( true );

		if ( ! siteTitle ) {
			focusOnSiteTitleInput();
			return;
		}

		dispatch.setSiteTitle( siteTitle );
		const variation = styles.find( ( style ) => style.name === checked ) || styles[ 0 ];
		dispatch.setSelectedStyleVariation( {
			slug: variation.name,
			title: variation.title,
		} as StyleVariation );
		submit?.();
	}, [ siteTitle, dispatch, submit, checked ] );

	const preview = <ThemeStylePreviews styles={ styles } active={ checked } />;

	useEffect( () => {
		focusOnSiteTitleInput();
	}, [] );

	return (
		<SenseiStepContainer stepName="senseiSetup" recordTracksEvent={ recordTracksEvent }>
			<div className="sensei-start-row">
				<div className="sensei-onboarding-main-content">
					<Title>{ preventWidows( __( 'Set up your course site' ) ) }</Title>
					<Label htmlFor="sensei_site_title">{ __( 'Site name' ) }</Label>
					<Input
						id="sensei_site_title"
						type="text"
						onChange={ ( ev ) => {
							setHasSubmitted( false );
							setSiteTitle( ev.target.value );
						} }
						placeholder={ __( 'Photography Class' ) }
						value={ siteTitle }
						ref={ inputRef }
					/>
					{ hasSubmitted && ! siteTitle && (
						<FormInputValidation
							isError
							text={ __( `Oops. Looks like your course site doesn't have a name yet.` ) }
						/>
					) }
					<Label>{ __( 'Pick a style' ) }</Label>
					<Hint>
						{ __( 'Choose a different theme style now, or customize colors and fonts later.' ) }
					</Hint>
					<div className="sensei-theme-style-selector">
						{ styles.map( ( item, i ) => (
							<FormRadioWithThumbnail
								label={ item.title }
								key={ i }
								value={ item.name }
								thumbnail={ {
									cssClass: `${ item.name } ${ item.name === checked ? 'checked' : '' }`,
								} }
								checked={ item.name === checked }
								onChange={ handleChange }
								disabled={ undefined }
							/>
						) ) }
					</div>
					{ ! isDesktop && preview }
					<div className="sensei-onboarding-action">
						<div className="sensei-onboarding-action__content">
							<button className="sensei-button" onClick={ handleSubmit }>
								{ __( 'Continue' ) }
							</button>
							<p className="sensei-style-notice">
								<Gridicon icon="notice-outline" />
								{ __( 'You can change all of this later, too.' ) }
							</p>
						</div>
					</div>
				</div>
				{ isDesktop && preview }
			</div>
		</SenseiStepContainer>
	);
};

export default SenseiSetup;
