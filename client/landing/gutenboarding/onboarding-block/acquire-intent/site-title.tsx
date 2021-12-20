import { useDispatch, useSelect } from '@wordpress/data';
import { Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import * as React from 'react';
import useTyper from '../../hooks/use-typer';
import { recordSiteTitleSelection } from '../../lib/analytics';
import { useIsAnchorFm } from '../../path';
import { STORE_KEY } from '../../stores/onboard';
import AcquireIntentTextInput from './acquire-intent-text-input';
import tip from './tip';

interface Props {
	onSubmit: () => void;
	inputRef: React.MutableRefObject< HTMLInputElement | undefined >;
}

const SiteTitle: React.FunctionComponent< Props > = ( { onSubmit, inputRef } ) => {
	const { __, _x } = useI18n();
	const { siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const isAnchorFmSignup = useIsAnchorFm();
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const [ isTouched, setIsTouched ] = React.useState( false );
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

	const placeHolder = useTyper( siteTitleExamples, ! siteTitle, {
		delayBetweenCharacters: 70,
	} );

	return (
		<form
			className={ classnames( 'site-title', { 'is-touched': isTouched } ) }
			onSubmit={ handleFormSubmit }
		>
			<label
				htmlFor="site-title__input"
				className="site-title__input-label"
				data-e2e-string="My site is called"
			>
				{ /* translators: label for site title input in Gutenboarding */ }
				{ isAnchorFmSignup ? __( 'My podcast is called' ) : __( 'My site is called' ) }
			</label>
			<div className="site-title__input-wrapper">
				{ /* Adding key makes it more performant
					because without it the element is recreated
					for every letter in the typing animation
					*/ }
				<AcquireIntentTextInput
					ref={ inputRef as React.MutableRefObject< HTMLInputElement | null > }
					key="site-title__input"
					onChange={ setSiteTitle }
					onFocus={ handleFocus }
					onBlur={ handleBlur }
					value={ siteTitle }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					placeholder={ placeHolder }
				></AcquireIntentTextInput>
				<p className="site-title__input-hint">
					<Icon icon={ tip } size={ 18 } />
					{ /* translators: The "it" here refers to the site title. */ }
					<span data-e2e-string="Don't worry, you can change it later.">
						{ __( "Don't worry, you can change it later." ) }
					</span>
				</p>
			</div>
		</form>
	);
};

export default SiteTitle;
