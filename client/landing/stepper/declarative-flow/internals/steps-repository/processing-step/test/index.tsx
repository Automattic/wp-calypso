/**
 * @jest-environment jsdom
 */

jest.mock( 'calypso/components/data/document-head', () => ( {
	__esModule: true,
	default: () => null,
} ) );

jest.mock( 'calypso/components/loading', () => ( {
	__esModule: true,
	default: ( { title, subtitle }: { title?: string; subtitle?: ReactNode } ) => (
		<div>
			{ title }
			{ subtitle }
		</div>
	),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	StepContainer: ( { stepContent }: { stepContent?: ReactNode } ) => <div>{ stepContent }</div>,
	Step: { Loading: ( { title }: { title?: string } ) => <div>{ title }</div> },
	isNewSiteMigrationFlow: () => false,
	isUpdateDesignFlow: () => false,
	isAnyHostingFlow: () => false,
	isNewsletterFlow: () => false,
	isAIBuilderOnboardingFlow: () => false,
	isNewHostedSiteCreationFlow: () => false,
	isTransferringHostedSiteCreationFlow: () => false,
	HUNDRED_YEAR_DOMAIN_FLOW: 'hundred-year-domain-flow',
	HUNDRED_YEAR_PLAN_FLOW: 'hundred-year-plan-flow',
	HUNDRED_YEAR_DOMAIN_TRANSFER: 'hundred-year-domain-transfer',
} ) );

jest.mock( '../../../../helpers/should-use-step-container-v2', () => ( {
	shouldUseStepContainerV2: () => false,
} ) );

jest.mock( '../hooks/use-processing-loading-messages', () => ( {
	useProcessingLoadingMessages: () => [
		{ title: 'Default first step', duration: 2000 },
		{ title: 'Default second step', duration: 3000 },
	],
} ) );

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( select: () => Record< string, () => undefined > ) => unknown ) =>
		mapSelect( () => ( {
			getPendingAction: () => undefined,
			getProgress: () => undefined,
			getProgressTitle: () => undefined,
			getStepData: () => undefined,
		} ) ),
	useDispatch: () => ( { setSiteSetupError: jest.fn(), clearSiteSetupError: jest.fn() } ),
} ) );

jest.mock( 'calypso/lib/interval', () => ( { useInterval: () => undefined } ) );

jest.mock( 'calypso/landing/stepper/hooks/use-record-signup-complete', () => ( {
	useRecordSignupComplete: () => jest.fn(),
} ) );

jest.mock( '../../../../../hooks/use-capture-flow-exception', () => ( {
	__esModule: true,
	default: () => jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/declarative-flow/registered-flows', () => ( {
	__esModule: true,
	default: {},
} ) );

jest.mock( 'calypso/landing/stepper/stores', () => ( {
	ONBOARD_STORE: 'ONBOARD_STORE',
	SITE_STORE: 'SITE_STORE',
	STEPPER_INTERNAL_STORE: 'STEPPER_INTERNAL_STORE',
} ) );

jest.mock( 'calypso/lib/analytics/signup', () => ( { recordSignupProcessingScreen: jest.fn() } ) );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( 'calypso/state/selectors/get-wccom-from', () => ( {
	__esModule: true,
	default: () => undefined,
} ) );

import { render, screen } from '@testing-library/react';
import ProcessingStep from '..';
import type { ReactNode } from 'react';

// `build` is a V1 flow (not in the StepContainer V2 list) and none of the
// tailored / hundred-year short-circuits apply, so it renders the generic
// loading carousel.
const renderProcessingStep = ( props = {} ) =>
	render(
		<ProcessingStep
			flow="build"
			stepName="processing-step"
			navigation={ { submit: jest.fn() } }
			{ ...props }
		/>
	);

describe( 'ProcessingStep loading-carousel accepts-props', () => {
	it( 'renders the default per-flow carousel when no loadingMessages prop is passed', async () => {
		renderProcessingStep();

		expect( await screen.findByText( 'Default first step' ) ).toBeVisible();
	} );

	it( 'renders the flow-provided loadingMessages override instead of the default', async () => {
		renderProcessingStep( {
			loadingMessages: [
				{ title: 'Custom first step', duration: 1000 },
				{ title: 'Custom second step' },
			],
		} );

		expect( await screen.findByText( 'Custom first step' ) ).toBeVisible();
		expect( screen.queryByText( 'Default first step' ) ).not.toBeInTheDocument();
	} );
} );
