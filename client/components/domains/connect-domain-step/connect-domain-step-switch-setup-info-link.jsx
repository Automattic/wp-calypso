/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { __ } from '@wordpress/i18n';
import { createElement, createInterpolateElement } from '@wordpress/element';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { stepType, modeType } from './constants';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

export default function ConnectDomainStepSwitchSetupInfoLink( {
	baseClassName,
	currentStep,
	currentMode,
	onSwitchToAdvancedSetup,
	onSwitchToSuggestedSetup,
} ) {
	if ( [ stepType.CONNECTED, stepType.VERIFYING ].includes( currentStep ) ) {
		return null;
	}

	const message =
		modeType.ADVANCED === currentMode ? (
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement( __( 'Switch to our <a>suggested setup</a>.' ), {
					a: createElement( 'a', { onClick: onSwitchToSuggestedSetup } ),
				} ) }
			</span>
		) : (
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement( __( 'Switch to our <a>advanced setup</a>.' ), {
					a: createElement( 'a', { onClick: onSwitchToAdvancedSetup } ),
				} ) }
			</span>
		);

	const classes = classNames( baseClassName + '__switch-setup', baseClassName + '__info-links' );

	return (
		<div className={ classes }>
			<Gridicon
				className={ baseClassName + '__info-links-icon' }
				icon="pages"
				size={ 16 } /* eslint-disable-line */
			/>{ ' ' }
			{ message }
		</div>
	);
}

ConnectDomainStepSwitchSetupInfoLink.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	currentMode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	currentStep: PropTypes.oneOf( Object.values( stepType ) ).isRequired,
	onSwitchToAdvancedSetup: PropTypes.func.isRequired,
	onSwitchToSuggestedSetup: PropTypes.func.isRequired,
};
