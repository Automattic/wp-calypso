/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button, TextControl } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordSiteTitleSelection, recordSiteTitleSkip } from '../../lib/analytics';

interface Props {
	onSubmit: () => void;
	skippable: boolean;
}

const SiteTitle: React.FunctionComponent< Props > = ( { onSubmit, skippable } ) => {
	const { __ } = useI18n();
	const { siteTitle } = useSelect( ( select ) => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );

	const handleFormSubmit = ( e: React.KeyboardEvent< HTMLSpanElement > ) => {
		// hitting 'Enter' when focused on the input field should direct to next step.
		e.preventDefault();
		onSubmit();
	};

	const handleBlur = () => {
		recordSiteTitleSelection( !! siteTitle );
	};

	const handleSkip = () => {
		setSiteTitle( '' ); // reset site title if there is no valid entry
		recordSiteTitleSkip();
		onSubmit();
	};

	// translators: label for site title input in Gutenboarding
	const inputLabel = __( 'My site is called' );

	// translators: Button label for skipping filling an optional input in onboarding
	const skipLabel = __( 'Skip for now' );

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
				{ skippable && (
					<Button isLink onClick={ handleSkip } className="acquire-intent__skip-site-title">
						{ skipLabel }
					</Button>
				) }
			</div>
		</form>
	);
};

export default SiteTitle;
