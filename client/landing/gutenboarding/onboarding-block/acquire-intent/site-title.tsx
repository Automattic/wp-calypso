/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { Icon } from '@wordpress/icons';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordSiteTitleSelection } from '../../lib/analytics';
import tip from './tip';

interface Props {
	onSubmit: () => void;
}

const SiteTitle: React.FunctionComponent< Props > = ( { onSubmit } ) => {
	const { __ } = useI18n();
	const { siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleFormSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		// hitting 'Enter' when focused on the input field should direct to next step.
		e.preventDefault();
		onSubmit();
	};

	const handleBlur = () => {
		recordSiteTitleSelection( !! siteTitle );
	};

	// translators: label for site title input in Gutenboarding
	const inputLabel = __( 'My site is called' );

	return (
		<form className="site-title" onSubmit={ handleFormSubmit }>
			<label htmlFor="site-title__input" className="site-title__input-label">
				{ inputLabel }
			</label>
			<div className="site-title__input-wrapper">
				<TextControl
					id="site-title__input"
					className="site-title__input"
					onChange={ setSiteTitle }
					onBlur={ handleBlur }
					value={ siteTitle }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					spellCheck={ false }
					autoComplete="off"
					autoCorrect="off"
					data-hj-whitelist
				/>
				<p className={ classnames( 'site-title__input-hint', { 'has-site-title': !! siteTitle } ) }>
					<Icon icon={ tip } size={ 14 } />
					<span>{ __( "Don't worry, you can change it later." ) }</span>
				</p>
			</div>
		</form>
	);
};

export default SiteTitle;
