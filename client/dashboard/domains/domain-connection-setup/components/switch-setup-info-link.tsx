import { __experimentalHStack as HStack, Button, Icon } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { pages } from '@wordpress/icons';
import { isSubdomain } from '../../../../lib/domains';
import { modeType, stepType, stepSlug } from '../constants';
import type { ModeType, StepType, StepSlug } from '../types';
import './style.scss';

interface SwitchSetupInfoLinkProps {
	currentStep: StepType;
	currentMode: ModeType;
	supportsDomainConnect: boolean;
	domainName: string;
	setPage: ( pageSlug: StepSlug ) => void;
}

export default function SwitchSetupInfoLink( {
	currentStep,
	currentMode,
	supportsDomainConnect,
	domainName,
	setPage,
}: SwitchSetupInfoLinkProps ) {
	if ( currentStep === stepType.CONNECTED || currentStep === stepType.VERIFYING ) {
		return null;
	}

	const isSubdomainDomain = isSubdomain( domainName );

	const switchToAdvancedSetup = () =>
		setPage( isSubdomainDomain ? stepSlug.SUBDOMAIN_ADVANCED_START : stepSlug.ADVANCED_START );
	const switchToSuggestedSetup = () =>
		setPage( isSubdomainDomain ? stepSlug.SUBDOMAIN_SUGGESTED_START : stepSlug.SUGGESTED_START );
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
		if ( currentMode === modeType.SUGGESTED && isSubdomainDomain ) {
			return __(
				"Can't set NS records for your subdomain? Switch to our <aadv>advanced setup</aadv>."
			);
		} else if ( currentMode === modeType.ADVANCED ) {
			return __( 'Switch to our <asug>suggested setup</asug>.' );
		}
		return __( 'Switch to our <aadv>advanced setup</aadv>.' );
	};

	return (
		<HStack justify="flex-start" className="dashboard-domain-connect-switch-setup-info-link">
			<Icon
				icon={ pages }
				size={ 16 }
				className="dashboard-domain-connect-switch-setup-info-link__icon"
			/>
			<span>
				{ createInterpolateElement( getMessage(), {
					asug: <Button variant="link" onClick={ switchToSuggestedSetup } />,
					aadv: <Button variant="link" onClick={ switchToAdvancedSetup } />,
					adc: <Button variant="link" onClick={ switchToDomainConnectSetup } />,
				} ) }
			</span>
		</HStack>
	);
}
