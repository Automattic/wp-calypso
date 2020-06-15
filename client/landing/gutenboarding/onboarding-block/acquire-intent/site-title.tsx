/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
<<<<<<< HEAD
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';
=======
import { _x } from '@wordpress/i18n';
>>>>>>> Add placeholder to site title input

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordSiteTitleSelection } from '../../lib/analytics';
<<<<<<< HEAD
import tip from './tip';

=======
import useTyper from '../../hooks/use-typer';
>>>>>>> Add placeholder to site title input
interface Props {
	skipButton: React.ReactNode;
	onSubmit: () => void;
}

const SiteTitle: React.FunctionComponent< Props > = ( { skipButton, onSubmit } ) => {
	const { __ } = useI18n();
	const { siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const [ isFocused, setIsFocused ] = React.useState( false );

	const handleFormSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		// hitting 'Enter' when focused on the input field should direct to next step.
		e.preventDefault();
		onSubmit();
	};

	const handleBlur = () => {
		recordSiteTitleSelection( !! siteTitle );
		setIsFocused( false );
	};

	const handleFocus = () => {
		setIsFocused( true );
	};

	// translators: label for site title input in Gutenboarding
	const inputLabel = __( 'My site is called' );

	const placeHolder = useTyper(
		[
			_x(
				'In Focus Photographers',
				'This is an example of a site name, feel free to create your own but please keep it under 22 characters'
			),
			_x(
				'Cortado Coffee SF',
				'This is an example of a site name, feel free to create your own but please keep it under 22 characters'
			),
			_x(
				'Leah Rand',
				'This is an example of a site name, feel free to create your own but please keep it under 22 characters'
			),
			_x(
				'Ava Young',
				'This is an example of a site name, feel free to create your own but please keep it under 22 characters'
			),
			_x(
				'Mighty Leaf Tea Room',
				'This is an example of a site name, feel free to create your own but please keep it under 22 characters'
			),
		],
		! siteTitle,
		{
			delayBetweenCharacters: 70,
		}
	);

	return (
		<form
			className={ classnames( 'site-title', { 'is-focused': isFocused, 'is-empty': ! siteTitle } ) }
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
					<Icon icon={ tip } size={ 14 } />
					{ /* translators: The "it" here refers to the site title. */ }
					<span>{ __( "Don't worry, you can change it later." ) }</span>
				</p>
			</div>
		</form>
	);
};

export default SiteTitle;
