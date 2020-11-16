/**
 * External dependencies
 */
import React from 'react';
import { __ } from '@wordpress/i18n';
import { useHistory } from 'react-router-dom';
import { Icon, chevronLeft } from '@wordpress/icons';
import './style.scss';

declare const __i18n_text_domain__: string;

export default function GoBackButton() {
	return (
		<button className="go-back-button__focused-launch" onClick={ useHistory().goBack }>
			<Icon icon={ chevronLeft } />
			{ __( 'Go back', __i18n_text_domain__ ) }
		</button>
	);
}
