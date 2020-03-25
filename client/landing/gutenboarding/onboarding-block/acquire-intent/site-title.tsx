/**
 * External dependencies
 */
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { Step, usePath } from '../../path';
import MadLib from './madlib';

const SiteTitle: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );
	const { setSiteTitle } = useDispatch( STORE_KEY );
	const history = useHistory();
	const makePath = usePath();

	const handleChange = ( e: React.ChangeEvent< HTMLInputElement > ) =>
		setSiteTitle( e.target.value.trim().length ? e.target.value : '' );

	const value = siteTitle.length ? siteTitle : '';

	// translators: Form input for a site's title where "<Input />" is replaced by user input and must be preserved verbatim in translated string.
	const textInput = NO__( 'Itʼs called <Input />.' );

	// As last input on first step, hitting 'Enter' should direct to next step.
	const handleSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();
		history.push( makePath( Step.DesignSelection ) );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<MadLib onChange={ handleChange } value={ value }>
				{ textInput }
			</MadLib>
		</form>
	);
};

export default SiteTitle;
