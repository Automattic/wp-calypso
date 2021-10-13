import { Gridicon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { stepType, modeType, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepSwitchSetupInfoLink( {
	baseClassName,
	currentStep,
	currentMode,
	setPage,
} ) {
	const { __ } = useI18n();

	if ( [ stepType.CONNECTED, stepType.VERIFYING ].includes( currentStep ) ) {
		return null;
	}

	const switchToAdvancedSetup = () => setPage( stepSlug.ADVANCED_START );
	const switchToSuggestedSetup = () => setPage( stepSlug.SUGGESTED_START );

	const message =
		modeType.ADVANCED === currentMode ? (
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement( __( 'Switch to our <a>suggested setup</a>.' ), {
					a: createElement( 'a', { onClick: switchToSuggestedSetup } ),
				} ) }
			</span>
		) : (
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement( __( 'Switch to our <a>advanced setup</a>.' ), {
					a: createElement( 'a', { onClick: switchToAdvancedSetup } ),
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
	setPage: PropTypes.func.isRequired,
};
