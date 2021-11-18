import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import Confirm from './confirm';
import Install from './install';
import Transfer from './transfer';
import type { GoToStep } from '../../types';

import './style.scss';

interface WooCommerceInstallProps {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
	isReskinned: boolean;
	queryObject: {
		siteSlug: string;
	};
}

export default function WooCommerceInstall( props: WooCommerceInstallProps ): ReactElement | null {
	const { __ } = useI18n();

	const { stepName, isReskinned, goToStep, stepSectionName } = props;

	if ( stepName === 'confirm' ) {
		return (
			<Confirm
				goToStep={ goToStep }
				isReskinned={ isReskinned }
				stepSectionName={ stepSectionName }
			/>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ true }
			backUrl="/woocommerce-installation"
			hideFormattedHeader={ true }
			className="woocommerce-install__step-wrapper"
			stepContent={
				<div className="woocommerce-install__step-content">
					{ stepName === 'transfer' && <Transfer goToStep={ goToStep } /> }
					{ stepName === 'install' && <Install goToStep={ goToStep } /> }
				</div>
			}
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}
