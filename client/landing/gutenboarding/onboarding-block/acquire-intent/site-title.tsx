/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
import { _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordSiteTitleSelection } from '../../lib/analytics';
import tip from './tip';

import useTyper from '../../hooks/use-typer';
interface Props {
	onSubmit: () => void;
}

/**
 * Shuffles an array in place
 *
 * @param arr the array to shuffle
 */
function shuffle( arr: string[] ) {
	return arr.sort( () => ( Math.random() > 0.5 ? -1 : 1 ) );
}

/* we have them outside ot the component to avoid re-shuffling on every render */
const siteTitleExamples = shuffle( [
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
] );

const SiteTitle: React.FunctionComponent< Props > = ( { onSubmit } ) => {
	const { __ } = useI18n();
	const { siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const [ isTouched, setIsTouched ] = React.useState( false );

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

	// translators: label for site title input in Gutenboarding
	const inputLabel = __( 'My site is called' );

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
				{ /* Adding key makes it more performant
					because without it the element is recreated
					for every letter in the typing animation
					*/ }
				<TextControl
					key="site-title__input"
					id="site-title__input"
					className="site-title__input"
					onChange={ setSiteTitle }
					onFocus={ handleFocus }
					onBlur={ handleBlur }
					value={ siteTitle }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					spellCheck={ false }
					autoComplete="off"
					placeholder={ placeHolder }
					autoCorrect="off"
					data-hj-whitelist
				></TextControl>
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
