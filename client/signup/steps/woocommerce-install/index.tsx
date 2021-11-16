import { useI18n } from '@wordpress/react-i18n';
import StepWrapper from 'calypso/signup/step-wrapper';
import Confirm from './confirm';
import Install from './install';
import Transfer from './transfer';
import type { GoToStep } from '../../types';
import type { ReactElement } from 'react';

import './style.scss';

interface WooCommerceInstallProps {
	goToStep: GoToStep;
	stepName: string;
	stepSectionName: string;
	queryObject: {
		siteSlug: string;
	};
}

export default function WooCommerceInstall( props: WooCommerceInstallProps ): ReactElement | null {
	const { __ } = useI18n();

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
					{ props.stepName === 'confirm' && <Confirm goToStep={ props.goToStep } /> }
					{ props.stepName === 'transfer' && <Transfer goToStep={ props.goToStep } /> }
					{ props.stepName === 'install' && <Install goToStep={ props.goToStep } /> }
				</div>
			}
			{ ...props }
		/>
	);
}
