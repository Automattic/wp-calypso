import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import StepWrapper from 'calypso/signup/step-wrapper';
import { GoToStep } from '../../types';
import Complete from './complete';
import Confirm from './confirm';
import Install from './install';
import Transfer from './transfer';

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
			classNames="woocommerce-install__step-wrapper"
			stepContent={
				<div className="woocommerce-install__step-content">
					{ props.stepName === 'confirm' && <Confirm goToStep={ props.goToStep } /> }
					{ props.stepName === 'transfer' && <Transfer goToStep={ props.goToStep } /> }
					{ props.stepName === 'install' && <Install goToStep={ props.goToStep } /> }
					{ props.stepName === 'complete' && <Complete goToStep={ props.goToStep } /> }
				</div>
			}
			{ ...props }
		/>
	);
}
