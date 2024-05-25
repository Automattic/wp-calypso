/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as signupUtils from 'calypso/signup/utils';
import { NavigationLink } from '../';

jest.mock( 'calypso/signup/utils', () => ( {
	getStepUrl: jest.fn(),
	getFilteredSteps: jest.fn(),
	getPreviousStepName: jest.fn(),
	isFirstStepInFlow: jest.fn(),
} ) );

jest.mock( '@automattic/components/src/gridicon', () => {
	return ( { icon } ) => <div data-testid={ `gridicon-${ icon }` } />;
} );

const noop = () => {};
const { getStepUrl, getFilteredSteps, getPreviousStepName, isFirstStepInFlow } = signupUtils;

describe( 'NavigationLink', () => {
	const props = {
		flowName: 'test:flow',
		stepName: 'test:step2',
		positionInFlow: 1,
		stepSectionName: 'test:section',
		signupProgress: {
			'test:step1': { stepName: 'test:step1', stepSectionName: 'test:section1', wasSkipped: false },
			'test:step2': { stepName: 'test:step2', stepSectionName: 'test:section2', wasSkipped: false },
			'test:step3': { stepName: 'test:step3', stepSectionName: 'test:section3', wasSkipped: false },
		},
		recordTracksEvent: noop,
		submitSignupStep: noop,
		goToPreviousStep: jest.fn(),
		goToNextStep: jest.fn(),
		translate: ( str ) => `translated:${ str }`,
		userLoggedIn: true,
	};

	beforeEach( () => {
		getPreviousStepName.mockReturnValue( 'test:step1' );
		isFirstStepInFlow.mockReturnValue( false );
		getFilteredSteps.mockReturnValue( Object.values( props.signupProgress ) );
	} );

	afterEach( () => {
		getStepUrl.mockReset();
		props.goToPreviousStep.mockReset();
		props.goToNextStep.mockReset();
	} );

	test( 'should render Button element', () => {
		render( <NavigationLink { ...props } /> );
		expect( screen.queryByRole( 'button' ) ).toHaveClass( 'navigation-link' );
	} );

	test( 'should render no icons when the direction prop is undefined', () => {
		render( <NavigationLink { ...props } /> );
		expect( screen.queryByTestId( /gridicon-/ ) ).not.toBeInTheDocument();
	} );

	test( 'should render right-arrow icon when the direction prop is "forward".', () => {
		render( <NavigationLink { ...props } direction="forward" /> );

		expect( screen.queryByText( 'translated:Skip for now' ) ).toBeVisible();
		expect( screen.queryAllByTestId( /gridicon-/ ) ).toHaveLength( 1 );
		expect( screen.queryByTestId( 'gridicon-arrow-right' ) ).toBeVisible();
	} );

	test( 'should render left-arrow icon when the direction prop is "back".', () => {
		render( <NavigationLink { ...props } direction="back" /> );

		expect( screen.queryByText( 'translated:Back' ) ).toBeVisible();
		expect( screen.queryAllByTestId( /gridicon-/ ) ).toHaveLength( 1 );
		expect( screen.queryByTestId( 'gridicon-arrow-left' ) ).toBeVisible();
	} );

	test( 'should set href prop to undefined when the direction is not "back".', () => {
		render( <NavigationLink { ...props } direction="forward" /> );
		expect( screen.getByRole( 'button' ) ).not.toHaveAttribute( 'href' );
	} );

	test( 'should set a proper url as href prop when the direction is "back".', () => {
		expect( getStepUrl ).not.toHaveBeenCalled();

		const { rerender } = render(
			// We're mocking a logged-out user to ensure locale is being considered
			<NavigationLink { ...props } userLoggedIn={ false } direction="back" />
		);

		// It should call getStepUrl()
		expect( getStepUrl ).toHaveBeenCalled();
		expect( getStepUrl ).toHaveBeenCalledWith(
			'test:flow',
			'test:step1',
			'test:section1',
			'en',
			undefined
		);

		// when it is the first step
		getStepUrl.mockReset();
		getPreviousStepName.mockReturnValue( 'test:step1' );
		isFirstStepInFlow.mockReturnValue( true );
		getFilteredSteps.mockReturnValue( [
			{ stepName: 'test:step1', stepSectionName: 'test:section1', wasSkipped: false },
		] );

		rerender(
			<NavigationLink { ...props } userLoggedIn={ false } direction="back" stepName="test:step1" />
		);
		expect( getStepUrl ).toHaveBeenCalled();
		expect( getStepUrl ).toHaveBeenCalledWith( 'test:flow', null, '', 'en', undefined );

		// The href should be backUrl when exist.
		rerender(
			<NavigationLink
				{ ...props }
				userLoggedIn={ false }
				direction="back"
				backUrl="test:back-url"
			/>
		);
		expect( screen.getByRole( 'link' ) ).toHaveAttribute( 'href', 'test:back-url' );
	} );

	test( 'should call goToNextStep() only when the direction is forward and clicked', async () => {
		const user = userEvent.setup();
		render( <NavigationLink { ...props } direction="forward" /> );

		expect( props.goToNextStep ).not.toHaveBeenCalled();
		await user.click( screen.getByRole( 'button' ) );
		expect( props.goToNextStep ).toHaveBeenCalled();
	} );

	test( 'should not call goToNextStep() when the direction is back', async () => {
		const user = userEvent.setup();
		render( <NavigationLink { ...props } direction="back" /> );

		expect( props.goToNextStep ).not.toHaveBeenCalled();
		await user.click( screen.getByRole( 'button' ) );
		expect( props.goToNextStep ).not.toHaveBeenCalled();
	} );

	test( 'should call goToPreviousStep() only when the direction is back and clicked', async () => {
		const user = userEvent.setup();
		render( <NavigationLink { ...props } direction="back" /> );

		expect( props.goToPreviousStep ).not.toHaveBeenCalled();
		await user.click( screen.getByRole( 'button' ) );
		expect( props.goToPreviousStep ).toHaveBeenCalled();
	} );

	test( 'should not call goToPreviousStep() when the direction is forward', async () => {
		const user = userEvent.setup();
		render( <NavigationLink { ...props } direction="forward" /> );

		expect( props.goToPreviousStep ).not.toHaveBeenCalled();
		await user.click( screen.getByRole( 'button' ) );
		expect( props.goToPreviousStep ).not.toHaveBeenCalled();
	} );

	test( 'getPreviousStep() When in 2nd step should return 1st step', () => {
		const navigationLink = new NavigationLink( props );
		const { flowName, signupProgress, stepName } = props;
		getPreviousStepName.mockReturnValue( 'test:step1' );
		const previousStep = navigationLink.getPreviousStep( flowName, signupProgress, stepName );
		expect( previousStep.stepName ).toBe( 'test:step1' );
	} );

	test( 'getPreviousStep() When in 1st step should return nullish step', () => {
		const navigationLink = new NavigationLink( props );
		const { flowName, signupProgress } = props;
		isFirstStepInFlow.mockReturnValue( true );
		const previousStep = navigationLink.getPreviousStep( flowName, signupProgress, 'test:step1' );
		expect( previousStep.stepName ).toBe( null );
	} );

	test( 'getPreviousStep() When in 3rd step should return 2nd step', () => {
		const navigationLink = new NavigationLink( props );
		const { flowName, signupProgress } = props;
		getPreviousStepName.mockReturnValue( 'test:step2' );
		isFirstStepInFlow.mockReturnValue( false );
		const previousStep = navigationLink.getPreviousStep( flowName, signupProgress, 'test:step3' );
		expect( previousStep.stepName ).toBe( 'test:step2' );
	} );

	test( 'getPreviousStep() When current steps is unknown, step should return last step in progress which belong to the current flow', () => {
		const navigationLink = new NavigationLink( props );
		const { flowName, signupProgress } = props;

		const singupProgressWithSomeStepsThatDoNotBelongToThisFlow = {
			...signupProgress,
			'some-random-step': {
				stepName: 'test:step4',
				stepSectionName: 'test:section4',
				wasSkipped: false,
			},
		};

		isFirstStepInFlow.mockReturnValue( false );
		//Mock getPreviousStepName() Will return undefined since 'some-other-random-step' does not belong to this flow
		getPreviousStepName.mockReturnValue( undefined );
		const currentStepName = 'some-other-random-step';
		const previousStep = navigationLink.getPreviousStep(
			flowName,
			singupProgressWithSomeStepsThatDoNotBelongToThisFlow,
			currentStepName
		);
		const progressStepNames = Object.keys( signupProgress );
		expect( previousStep.stepName ).toBe( progressStepNames[ progressStepNames.length - 1 ] );
	} );

	test( 'getPreviousStep() When current progress does not contain any step of the current flow return nullish step', () => {
		const navigationLink = new NavigationLink( props );
		const { flowName } = props;

		const singupProgressWithOnlyStepsThatDoNotBelongToThisFlow = {
			'test:some-random-step': {
				stepName: 'test:some-random-step',
				stepSectionName: 'test:some-random-step:section',
				wasSkipped: false,
			},
			'test:some-other-random-step': {
				stepName: 'test:some-other-random-step',
				stepSectionName: 'test:some-other-random-step',
				wasSkipped: false,
			},
		};

		//This simulates not having relevant steps in current flow
		getFilteredSteps.mockReturnValue( [] );

		isFirstStepInFlow.mockReturnValue( false );
		const currentStepName = 'test:whatever-current-step';
		const previousStep = navigationLink.getPreviousStep(
			flowName,
			singupProgressWithOnlyStepsThatDoNotBelongToThisFlow,
			currentStepName
		);
		expect( previousStep.stepName ).toBe( null );
	} );

	test( 'getPreviousStep() When there are skipped steps they should be ignored', () => {
		const { flowName, signupProgress } = props;
		const navigationLink = new NavigationLink( props );
		const stepsWithSkippedSteps = {
			'test:step1': { stepName: 'test:step1', stepSectionName: 'test:section1', wasSkipped: false },
			'test:step2': { stepName: 'test:step2', stepSectionName: 'test:section2', wasSkipped: true },
			'test:step3': { stepName: 'test:step3', stepSectionName: 'test:section3', wasSkipped: true },
			'test:step4': { stepName: 'test:step4', stepSectionName: 'test:section4', wasSkipped: false },
		};

		//According to step definitions the last step would return as mocked here
		getPreviousStepName.mockReturnValue( 'test:step3' );

		getFilteredSteps.mockReturnValue( Object.values( stepsWithSkippedSteps ) );
		isFirstStepInFlow.mockReturnValue( false );
		const previousStep = navigationLink.getPreviousStep( flowName, signupProgress, 'test:step4' );
		expect( previousStep.stepName ).toBe( 'test:step1' );
	} );
} );
