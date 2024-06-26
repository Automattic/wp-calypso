import { useTranslate } from 'i18n-calypso';
import LayoutStepper from 'calypso/a8c-for-agencies/components/layout/stepper';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import usePaymentMethod from '../../purchases/payment-methods/hooks/use-payment-method';
import type { SiteDetails } from '@automattic/data-stores';

type StepKey =
	| 'issueLicense'
	| 'reviewLicense'
	| 'addPaymentMethod'
	| 'assignLicense'
	| 'downloadProducts';

interface Step {
	key: StepKey;
	label: string;
}

interface Props {
	currentStep: StepKey;
	selectedSite?: SiteDetails | null;
	showDownloadStep?: boolean;
	showAssignLicenseStep?: boolean;
	isBundleLicensing?: boolean;
}

const AssignLicenseStepProgress = ( {
	currentStep,
	selectedSite,
	showDownloadStep,
	isBundleLicensing,
}: Props ) => {
	const translate = useTranslate();
	const { paymentMethodRequired } = usePaymentMethod();
	const sites = useSelector( getSites ).length;

	const steps: Step[] = [
		{
			key: 'issueLicense',
			label: isBundleLicensing ? translate( 'Select licenses' ) : translate( 'Issue new license' ),
		},
	];

	if ( isBundleLicensing ) {
		steps.push( {
			key: 'reviewLicense',
			label: translate( 'Review selections' ),
		} );
	}

	if ( paymentMethodRequired ) {
		steps.push( { key: 'addPaymentMethod', label: translate( 'Add Payment Method' ) } );
	}

	if ( sites > 0 && ! selectedSite ) {
		steps.push( {
			key: 'assignLicense',
			label: translate( 'Assign licenses' ),
		} );
	}

	if ( showDownloadStep ) {
		steps.push( { key: 'downloadProducts', label: translate( 'Download product' ) } );
	}

	// Don't show the breadcrumbs if we have less than 2 as they are not very informative in this case.
	if ( steps.length < 2 ) {
		return null;
	}

	const currentStepIndex = Math.max(
		steps.findIndex( ( step ) => step.key === currentStep ),
		0
	);

	return (
		<LayoutStepper steps={ steps.map( ( step ) => step.label ) } current={ currentStepIndex } />
	);
};

AssignLicenseStepProgress.defaultProps = {
	showDownloadStep: false,
};

export default AssignLicenseStepProgress;
