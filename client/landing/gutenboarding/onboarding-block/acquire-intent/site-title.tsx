/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { useViewportMatch } from '@wordpress/compose';
import config from 'calypso/config';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordSiteTitleSelection } from '../../lib/analytics';
import tip from './tip';
import AcquireIntentTextInput from './acquire-intent-text-input';
import useTyper from '../../hooks/use-typer';
import { useIsAnchorFm } from '../../path';

interface Props {
	onSubmit: () => void;
	inputRef: React.MutableRefObject< HTMLInputElement | undefined >;
}

const SiteTitle: React.FunctionComponent< Props > = ( { onSubmit, inputRef } ) => {
	const { __, _x } = useI18n();
	const siteTitle = useSelect( ( select ) => select( STORE_KEY ).getSelectedSiteTitle() );
	const isAnchorFmSignup = useIsAnchorFm();
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const [ isTouched, setIsTouched ] = React.useState( false );
	const showVerticalInput = config.isEnabled( 'gutenboarding/show-vertical-input' );
	const siteTitleExamples = [
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'The Local Latest', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'North Peak Cycling', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Sunshine Daycare', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Quick Wins Consulting', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Puns and Pedantry', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Yoga For Everyone', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Pugs Wearing Bowties', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Behind the Lens', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Marketing Magic', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Cortado Coffee', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Mumbai Bites', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'RPM Motors', 'sample site title' ),
		/* translators: This is an example of a site name,
		   feel free to create your own but please keep it under 22 characters */
		_x( 'Max’s Burger Bar', 'sample site title' ),
	];

	const handleFormSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		// hitting 'Enter' when focused on the input field should direct to next step.
		e.preventDefault();
		onSubmit();
	};

	const handleBlur = () => {
		recordSiteTitleSelection( !! siteTitle );
	};

	const handleFocus = () => {
		setIsTouched( true );
	};

	const isMobile = useViewportMatch( 'small', '<' );

	// translators: label for site title input in Gutenboarding
	let inputLabel;
	if ( showVerticalInput && ! isMobile ) {
		inputLabel = __( "It's called" );
	} else if ( isAnchorFmSignup ) {
		inputLabel = __( 'My podcast is called' );
	} else {
		inputLabel = __( 'My site is called' );
	}

	const placeHolder = useTyper( siteTitleExamples, ! siteTitle, {
		delayBetweenCharacters: 70,
	} );

	return (
		<form
			className={ classnames( 'site-title', { 'is-touched': isTouched } ) }
			onSubmit={ handleFormSubmit }
		>
			<label htmlFor="site-title__input" className="site-title__input-label">
				{ inputLabel }
			</label>
			<div className="site-title__input-wrapper">
				<AcquireIntentTextInput
					ref={ inputRef as React.MutableRefObject< HTMLInputElement | null > }
					onChange={ setSiteTitle }
					onFocus={ handleFocus }
					onBlur={ handleBlur }
					value={ siteTitle }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					placeholder={ placeHolder }
				/>
				<p className="site-title__input-hint">
					<Icon icon={ tip } size={ 18 } />
					{ /* translators: The "it" here refers to the site title. */ }
					<span>{ __( "Don't worry, you can change it later." ) }</span>
				</p>
			</div>
		</form>
	);
};

export default SiteTitle;
