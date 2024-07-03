import { Gridicon } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { stepType, modeType, stepSlug } from './constants';

import './style.scss';

export default function ConnectDomainStepSwitchSetupInfoLink( {
	baseClassName,
	currentStep,
	currentMode,
	supportsDomainConnect,
	isSubdomain,
	setPage,
} ) {
	const { __ } = useI18n();

	if ( [ stepType.CONNECTED, stepType.VERIFYING ].includes( currentStep ) ) {
		return null;
	}

	const switchToAdvancedSetup = () =>
		setPage( isSubdomain ? stepSlug.SUBDOMAIN_ADVANCED_START : stepSlug.ADVANCED_START );
	const switchToSuggestedSetup = () =>
		setPage( isSubdomain ? stepSlug.SUBDOMAIN_SUGGESTED_START : stepSlug.SUGGESTED_START );
	const switchToDomainConnectSetup = () => setPage( stepSlug.DC_START );

	const getMessage = () => {
		// Domain Connect does not support subdomains so we don't need to check for that
		if ( supportsDomainConnect ) {
			if ( currentMode === modeType.DC ) {
				return __( 'Switch to our <asug>manual setup</asug> or <aadv>advanced setup</aadv>.' );
			} else if ( currentMode === modeType.SUGGESTED ) {
				return __( 'Switch to our <adc>simple setup</adc> or <aadv>advanced setup</aadv>.' );
			}
			return __( 'Switch to our <adc>simple setup</adc> or <asug>manual setup</asug>.' );
		}
		if ( currentMode === modeType.SUGGESTED && isSubdomain ) {
			return __(
				"Can't set NS records for your subdomain? Switch to our <aadv>advanced setup</aadv>."
			);
		} else if ( currentMode === modeType.ADVANCED ) {
			return __( 'Switch to our <asug>suggested setup</asug>.' );
		}
		return __( 'Switch to our <aadv>advanced setup</aadv>.' );
	};

	const classes = clsx( baseClassName + '__switch-setup', baseClassName + '__info-links' );

	return (
		<div className={ classes }>
			<Gridicon
				className={ baseClassName + '__info-links-icon' }
				icon="pages"
				size={ 16 } /* eslint-disable-line */
			/>{ ' ' }
			<span className={ baseClassName + '__text' }>
				{ createInterpolateElement( getMessage(), {
					asug: createElement( 'a', { onClick: switchToSuggestedSetup } ),
					aadv: createElement( 'a', { onClick: switchToAdvancedSetup } ),
					adc: createElement( 'a', { onClick: switchToDomainConnectSetup } ),
				} ) }
			</span>
		</div>
	);
}

ConnectDomainStepSwitchSetupInfoLink.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	currentMode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	currentStep: PropTypes.oneOf( Object.values( stepType ) ).isRequired,
	supportsDomainConnect: PropTypes.bool.isRequired,
	setPage: PropTypes.func.isRequired,
};
