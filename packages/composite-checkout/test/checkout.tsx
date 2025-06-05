import {
	render,
	getAllByLabelText as getAllByLabelTextInNode,
	getByText as getByTextInNode,
	queryByText as queryByTextInNode,
	screen,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createContext, useState, useContext } from 'react';
import {
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepBody,
	useIsStepComplete,
	useTransactionStatus,
	usePaymentProcessor,
	CheckoutFormSubmit,
	CheckoutStepGroup,
	useSetStepComplete,
	useTogglePaymentMethod,
	makeErrorResponse,
	useMakeStepActive,
} from '../src/public-api';
import { PaymentProcessorFunction, PaymentProcessorResponseType } from '../src/types';
import { DefaultCheckoutSteps } from './utils/default-checkout-steps';

const myContext = createContext( undefined );
const usePaymentData = () => useContext( myContext );

function TogglePaymentMethodBlock( { mockMethod } ) {
	const togglePaymentMethod = useTogglePaymentMethod();

	return (
		<div>
			<button onClick={ () => togglePaymentMethod( mockMethod.id, false ) }>
				Disable Payment Method
			</button>
			<button onClick={ () => togglePaymentMethod( mockMethod.id, true ) }>
				Enable Payment Method
			</button>
		</div>
	);
}

const createMockMethod = createMockMethodFactory();

describe( 'Checkout', () => {
	describe( 'using the default steps', function () {
		describe( 'using other defaults', function () {
			let MyCheckout;
			const mockMethod = createMockMethod();
			const mockMethod2 = createMockMethod( {
				submitButton: <MockSubmitButton content="Second method" />,
				activeContent: <div />,
			} );
			const { items, total } = createMockItems();

			beforeEach( () => {
				MyCheckout = () => (
					<CheckoutProvider
						paymentMethods={ [ mockMethod, mockMethod2 ] }
						paymentProcessors={ getMockPaymentProcessors() }
						selectFirstAvailablePaymentMethod
					>
						<DefaultCheckoutSteps items={ items } />
						<TogglePaymentMethodBlock mockMethod={ mockMethod } />
					</CheckoutProvider>
				);
			} );

			it( 'renders the line items and the total', () => {
				const { container } = render( <MyCheckout /> );

				// Product line items show the correct price
				getAllByLabelTextInNode( container, items[ 0 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 0 ].amount )
				);
				getAllByLabelTextInNode( container, items[ 1 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 1 ].amount )
				);

				// All elements labeled 'Total' show the expected price
				getAllByLabelTextInNode( container, total.label ).map( ( element ) =>
					expect( element ).toHaveTextContent( total.amount )
				);
			} );

			it( 'renders the payment method label', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( mockMethod.inactiveContent )[ 0 ] ).toBeInTheDocument();
				expect( getAllByText( mockMethod2.inactiveContent )[ 0 ] ).toBeInTheDocument();
			} );

			it( 'renders the payment method label as selected', async () => {
				const { getAllByText, findByLabelText } = render( <MyCheckout /> );
				const user = userEvent.setup();
				await user.click( getAllByText( 'Continue' )[ 0 ] );
				const paymentMethod = await findByLabelText( mockMethod.inactiveContent );
				expect( paymentMethod ).toBeChecked();
			} );

			it( 'does not render the payment method label if the payment method is disabled', async () => {
				const { queryByText, getByText, getAllByText } = render( <MyCheckout /> );
				const user = userEvent.setup();
				await user.click( getAllByText( 'Continue' )[ 0 ] );
				await user.click( getByText( 'Disable Payment Method' ) );
				expect( queryByText( mockMethod.inactiveContent ) ).not.toBeVisible();
			} );

			it( 'does render the payment method label if the payment method is disabled then enabled', async () => {
				const { getAllByText, getByText } = render( <MyCheckout /> );
				const user = userEvent.setup();
				await user.click( getAllByText( 'Continue' )[ 0 ] );
				await user.click( getByText( 'Disable Payment Method' ) );
				await user.click( getByText( 'Enable Payment Method' ) );
				expect( getAllByText( mockMethod.inactiveContent )[ 0 ] ).toBeVisible();
			} );

			it( 'renders the second payment method label as selected if the first is disabled', async () => {
				const { getByText, getAllByText, findByLabelText } = render( <MyCheckout /> );
				const user = userEvent.setup();
				await user.click( getAllByText( 'Continue' )[ 0 ] );
				await user.click( getByText( 'Disable Payment Method' ) );
				const paymentMethod = await findByLabelText( mockMethod2.inactiveContent );
				expect( paymentMethod ).toBeChecked();
			} );

			it( 'renders the payment method activeContent', () => {
				const { getByTestId } = render( <MyCheckout /> );
				const activeComponent = getByTestId( 'mock-payment-form' );
				expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
			} );

			it( 'renders the review step', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 0 ].amount ) ).toHaveLength( 1 );
				expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 1 ].amount ) ).toHaveLength( 1 );
			} );

			it( 'renders the payment method submitButton', () => {
				const { getByText } = render( <MyCheckout /> );
				expect( getByText( 'Pay Please' ) ).toBeTruthy();
			} );
		} );

		describe( 'before clicking a button', function () {
			let container;

			beforeEach( () => {
				const mockMethod = createMockMethod();
				const { items } = createMockItems();
				const MyCheckout = () => (
					<CheckoutProvider
						paymentMethods={ [ mockMethod ] }
						paymentProcessors={ getMockPaymentProcessors() }
						selectFirstAvailablePaymentMethod
					>
						<DefaultCheckoutSteps items={ items } />
					</CheckoutProvider>
				);
				const renderResult = render( <MyCheckout /> );
				container = renderResult.container;
			} );

			it( 'renders steps', () => {
				const activeSteps = container.querySelectorAll( '.checkout-step' );
				expect( activeSteps ).toHaveLength( 2 );
			} );

			it( 'makes the review step active', () => {
				const activeSteps = container.querySelectorAll( '.checkout-step.is-active' );
				expect( activeSteps ).toHaveLength( 1 );
				expect( activeSteps[ 0 ] ).toHaveTextContent( 'Review your order' );
			} );

			it( 'makes the payment method step invisible', () => {
				const firstStep = container.querySelector( '.checkout__payment-method-step' );
				const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );

			it( 'makes the review step visible', () => {
				const reviewStep = container.querySelector( '.checkout__review-order-step' );
				expect( reviewStep ).toHaveTextContent( 'Review your order' );
				const reviewStepContent = reviewStep.querySelector( '.checkout-steps__step-content' );
				expect( reviewStepContent ).toHaveStyle( 'display: block' );
			} );
		} );

		describe( 'when clicking continue from the first step', function () {
			let container;

			beforeEach( async () => {
				const mockMethod = createMockMethod();
				const { items } = createMockItems();
				const MyCheckout = () => (
					<CheckoutProvider
						paymentMethods={ [ mockMethod ] }
						paymentProcessors={ getMockPaymentProcessors() }
						selectFirstAvailablePaymentMethod
					>
						<DefaultCheckoutSteps items={ items } />
					</CheckoutProvider>
				);
				const renderResult = render( <MyCheckout /> );
				container = renderResult.container;
				const firstStepContinue = renderResult.getAllByText( 'Continue' )[ 0 ];
				const user = userEvent.setup();
				await user.click( firstStepContinue );
			} );

			it( 'makes the first step invisible', async () => {
				const firstStep = container.querySelector( '.checkout__review-order-step' );
				const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
				await waitFor( () => {
					expect( firstStepContent ).toHaveStyle( 'display: none' );
				} );
			} );

			it( 'makes the next step visible', async () => {
				const reviewStep = container.querySelector( '.checkout__payment-method-step' );
				const reviewStepContent = reviewStep.querySelector( '.checkout-steps__step-content' );
				await waitFor( () => {
					expect( reviewStepContent ).toHaveStyle( 'display: block' );
				} );
			} );
		} );
	} );

	describe( 'with custom steps', function () {
		let MyCheckout;
		const mockMethod = createMockMethod();
		const steps = createMockStepObjects();
		let validateForm;

		beforeEach( () => {
			MyCheckout = ( props ) => {
				const [ paymentData, setPaymentData ] = useState( {} );
				const { stepObjectsWithStepNumber, stepObjectsWithoutStepNumber } =
					createStepsFromStepObjects( props.steps || steps );
				const createStepFromStepObject = createStepObjectConverter( paymentData );
				return (
					<myContext.Provider value={ [ paymentData, setPaymentData ] }>
						<CheckoutProvider
							paymentMethods={ [ mockMethod ] }
							paymentProcessors={ getMockPaymentProcessors() }
							selectFirstAvailablePaymentMethod
						>
							<CheckoutStepGroup>
								{ stepObjectsWithoutStepNumber.map( createStepFromStepObject ) }
								{ stepObjectsWithStepNumber.map( createStepFromStepObject ) }
								<CheckoutFormSubmit validateForm={ validateForm } />
							</CheckoutStepGroup>
						</CheckoutProvider>
					</myContext.Provider>
				);
			};
		} );

		it( 'renders the step className', () => {
			const { container } = render( <MyCheckout /> );
			expect( container.querySelector( '.' + steps[ 0 ].className ) ).toBeTruthy();
			expect( container.querySelector( '.' + steps[ 1 ].className ) ).toBeTruthy();
			expect( container.querySelector( '.' + steps[ 2 ].className ) ).toBeTruthy();
			expect( container.querySelector( '.' + steps[ 3 ].className ) ).toBeTruthy();
		} );

		it( 'renders the step titleContent', () => {
			const { getByText } = render( <MyCheckout /> );
			expect( getByText( 'Custom Step - Summary Title' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Contact Title' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Review Title' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Incomplete Title' ) ).toBeInTheDocument();
		} );

		it( 'renders the step activeStepContent always', () => {
			const { getByText } = render( <MyCheckout /> );
			expect( getByText( 'Custom Step - Summary Active' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Contact Active' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Review Active' ) ).toBeInTheDocument();
			expect( getByText( 'Custom Step - Incomplete Active' ) ).toBeInTheDocument();
		} );

		it( 'renders the activeStepContent as visible when active', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			const content = step.querySelector( '.checkout-steps__step-content' );
			expect( content ).toHaveStyle( 'display: block' );
		} );

		it( 'renders the activeStepContent as invisible when inactive', () => {
			const { container } = render( <MyCheckout /> );
			let step = container.querySelector( '.' + steps[ 0 ].className );
			let content = step.querySelector( '.checkout-steps__step-content' );
			expect( content ).toHaveStyle( 'display: none' );
			step = container.querySelector( '.' + steps[ 2 ].className );
			content = step.querySelector( '.checkout-steps__step-content' );
			expect( content ).toHaveStyle( 'display: none' );
		} );

		it( 'renders the step completeStepContent immediately for complete ContactStepBody', () => {
			const { getByText, queryByText } = render( <MyCheckout /> );
			expect( getByText( 'Custom Step - Summary Complete' ) ).toBeInTheDocument();
			expect( queryByText( 'Custom Step - Contact Complete' ) ).not.toBeInTheDocument();
			expect( queryByText( 'Custom Step - Review Complete' ) ).not.toBeInTheDocument();
			expect( queryByText( 'Custom Step - Incomplete Complete' ) ).not.toBeInTheDocument();
		} );

		it( 'renders the completeStepContent as visible when inactive and complete', () => {
			const { container } = render( <MyCheckout /> );
			let step = container.querySelector( '.' + steps[ 0 ].className );
			let content = step.querySelector( '.checkout-steps__step-complete-content' );
			expect( content ).toHaveStyle( 'display: block' );
			step = container.querySelector( '.' + steps[ 2 ].className );
			content = step.querySelector( '.checkout-steps__step-complete-content' );
			expect( content ).toBeNull;
			step = container.querySelector( '.' + steps[ 3 ].className );
			content = step.querySelector( '.checkout-steps__step-complete-content' );
			expect( content ).toBeNull;
		} );

		it( 'does not render the completeStepContent when active', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			const content = step.querySelector( '.checkout-steps__step-complete-content' );
			expect( content ).toBeNull;
		} );

		it( 'renders the continue button for the active step', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			expect( getByTextInNode( step, 'Continue' ) ).toBeInTheDocument();
		} );

		it( 'does not render the continue button for a step without a number', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 0 ].className );
			expect( queryByTextInNode( step, 'Continue' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render the continue button for an inactive step', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 2 ].className );
			expect( queryByTextInNode( step, 'Continue' ) ).not.toBeInTheDocument();
		} );

		it( 'renders the continue button enabled if the step is active and incomplete', () => {
			const { container } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 4 ], steps[ 1 ] ] } />
			);
			const step = container.querySelector( '.' + steps[ 4 ].className );
			expect( getByTextInNode( step, 'Continue' ) ).not.toBeDisabled();
		} );

		it( 'does not change steps if the continue button is clicked when the step is active and incomplete', async () => {
			const incompleteStep = {
				...steps[ 0 ],
				hasStepNumber: true,
				isCompleteCallback: () => false,
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ incompleteStep, steps[ 4 ], steps[ 1 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const firstStep = container.querySelector( '.' + steps[ 0 ].className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'does change steps if the continue button is clicked when the step is active and complete', async () => {
			const completeStep = { ...steps[ 0 ], hasStepNumber: true, isCompleteCallback: () => true };
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ completeStep, steps[ 4 ], steps[ 1 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const firstStep = container.querySelector( '.custom-summary-step-class' );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			await waitFor( () => {
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );
		} );

		it( 'disables the continue button while isCompleteCallback resolves a Promise', async () => {
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => new Promise( () => {} ),
			};
			const { getAllByText } = render(
				<MyCheckout steps={ [ stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			expect( firstStepContinue ).not.toBeDisabled();
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			expect( firstStepContinue ).toBeDisabled();
		} );

		it( 'does change steps if the continue button is clicked and the step becomes complete after a Promise resolves', async () => {
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => Promise.resolve( true ),
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const firstStep = container.querySelector( '.' + steps[ 1 ].className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			await waitFor( () => {
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );
		} );

		it( 'changes steps if useMakeStepActive is used', async () => {
			function ManualStepChangeButton( { stepId } ) {
				const setActiveStep = useMakeStepActive();
				return <button onClick={ () => setActiveStep( stepId ) }>Change step</button>;
			}
			const stepOne = {
				...steps[ 1 ],
				id: 'step-will-pass',
				className: 'step-will-pass',
			};
			const stepTwo = {
				...steps[ 1 ],
				activeStepContent: (
					<div>
						<span>Custom Step - Summary Active</span>
						<ManualStepChangeButton stepId={ steps[ 1 ].id } />
					</div>
				),
			};
			const { container, getAllByText } = render( <MyCheckout steps={ [ stepOne, stepTwo ] } /> );
			const manualContinue = getAllByText( 'Change step' )[ 0 ];
			const firstStep = container.querySelector( '.' + stepOne.className );
			const secondStep = container.querySelector( '.' + stepTwo.className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			const secondStepContent = secondStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
			const user = userEvent.setup();
			await user.click( manualContinue );
			await waitFor( () => {
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );
			expect( secondStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'changes steps to the first incomplete step if useMakeStepActive is used', async () => {
			function ManualStepChangeButton( { stepId } ) {
				const setActiveStep = useMakeStepActive();
				return <button onClick={ () => setActiveStep( stepId ) }>Change step</button>;
			}
			const stepOne = {
				...steps[ 1 ],
				id: 'step-will-fail',
				className: 'step-will-fail',
				isCompleteCallback: () => Promise.resolve( false ),
			};
			const stepTwo = {
				...steps[ 1 ],
				activeStepContent: (
					<div>
						<span>Custom Step - Summary Active</span>
						<ManualStepChangeButton stepId={ steps[ 1 ].id } />
					</div>
				),
			};
			const { container, getAllByText } = render( <MyCheckout steps={ [ stepOne, stepTwo ] } /> );
			const manualContinue = getAllByText( 'Change step' )[ 0 ];
			const firstStep = container.querySelector( '.' + stepOne.className );
			const secondStep = container.querySelector( '.' + stepTwo.className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			const secondStepContent = secondStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
			const user = userEvent.setup();
			await user.click( manualContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
		} );

		it( 'does change steps if useSetStepComplete is used and the step becomes complete after a Promise resolves', async () => {
			function ManualStepCompleteButton( { stepId } ) {
				const setStepComplete = useSetStepComplete();
				return <button onClick={ () => setStepComplete( stepId ) }>Complete manually</button>;
			}
			const stepWillPass = {
				...steps[ 1 ],
				id: 'step-will-pass',
				className: 'step-will-pass',
				isCompleteCallback: () => Promise.resolve( true ),
			};
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => Promise.resolve( true ),
				activeStepContent: (
					<div>
						<span>Custom Step - Summary Active</span>
						<ManualStepCompleteButton stepId={ steps[ 1 ].id } />
					</div>
				),
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ stepWillPass, stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const manualContinue = getAllByText( 'Complete manually' )[ 0 ];
			const firstStep = container.querySelector( '.' + stepWillPass.className );
			const secondStep = container.querySelector( '.' + stepWithAsyncIsComplete.className );
			const thirdStep = container.querySelector( '.' + steps[ 4 ].className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			const secondStepContent = secondStep.querySelector( '.checkout-steps__step-content' );
			const thirdStepContent = thirdStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
			const user = userEvent.setup();
			await user.click( manualContinue );
			await waitFor( () => {
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
			expect( thirdStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'does not change steps if useSetStepComplete is used and the previous step remains incomplete', async () => {
			function ManualStepCompleteButton( { stepId } ) {
				const setStepComplete = useSetStepComplete();
				return <button onClick={ () => setStepComplete( stepId ) }>Complete manually</button>;
			}
			const stepWillFail = {
				...steps[ 1 ],
				id: 'step-will-fail',
				className: 'step-will-fail',
				isCompleteCallback: () => Promise.resolve( false ),
			};
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => Promise.resolve( true ),
				activeStepContent: (
					<div>
						<span>Custom Step - Summary Active</span>
						<ManualStepCompleteButton stepId={ steps[ 1 ].id } />
					</div>
				),
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ stepWillFail, stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const manualContinue = getAllByText( 'Complete manually' )[ 0 ];
			const firstStep = container.querySelector( '.' + stepWillFail.className );
			const secondStep = container.querySelector( '.' + stepWithAsyncIsComplete.className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			const secondStepContent = secondStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
			const user = userEvent.setup();
			await user.click( manualContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			expect( secondStepContent ).toHaveStyle( 'display: none' );
		} );

		it( 'does not change steps if the continue button is clicked and the step remains incomplete after a Promise resolves', async () => {
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => Promise.resolve( false ),
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const firstStep = container.querySelector( '.' + steps[ 1 ].className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'does not change steps if useSetStepComplete is used and the step remains incomplete after a Promise resolves', async () => {
			function ManualStepCompleteButton( { stepId } ) {
				const setStepComplete = useSetStepComplete();
				return <button onClick={ () => setStepComplete( stepId ) }>Complete manually</button>;
			}
			const stepWithAsyncIsComplete = {
				...steps[ 1 ],
				isCompleteCallback: () => Promise.resolve( false ),
				activeStepContent: (
					<div>
						<span>Custom Step - Summary Active</span>
						<ManualStepCompleteButton stepId={ steps[ 1 ].id } />
					</div>
				),
			};
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ stepWithAsyncIsComplete, steps[ 4 ], steps[ 2 ] ] } />
			);
			const manualContinue = getAllByText( 'Complete manually' )[ 0 ];
			const firstStep = container.querySelector( '.' + steps[ 1 ].className );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			const user = userEvent.setup();
			await user.click( manualContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'renders the continue button enabled if the step is active and complete', async () => {
			const { container, getByLabelText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 4 ], steps[ 1 ] ] } />
			);

			const user = userEvent.setup();
			await user.type( getByLabelText( 'User Name' ), 'Lyra' );
			const step = container.querySelector( '.' + steps[ 4 ].className );
			expect( getByTextInNode( step, 'Continue' ) ).not.toBeDisabled();
		} );

		it( 'does not render the edit button for steps without a number', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 0 ].className );
			expect( queryByTextInNode( step, 'Edit' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render the edit button for the active step', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			expect( queryByTextInNode( step, 'Edit' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render the edit button for editable steps with a higher index than the active step', () => {
			const { container } = render( <MyCheckout /> );
			const step = container.querySelector( '.' + steps[ 2 ].className );
			expect( queryByTextInNode( step, 'Edit' ) ).not.toBeInTheDocument();
		} );

		it( 'renders the edit button for editable steps with a lower index than the active step', async () => {
			const { container, getAllByText } = render( <MyCheckout /> );
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			await waitFor( () => {
				expect( getByTextInNode( step, 'Edit' ) ).toBeInTheDocument();
			} );
		} );

		it( 'does not render the edit button if the form status is submitting', async () => {
			const { queryByText, getAllByText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 1 ], steps[ 2 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			await waitFor( () => {
				expect( queryByText( 'Edit' ) ).toBeInTheDocument();
			} );
			const submitButton = getAllByText( 'Pay Please' )[ 0 ];
			await user.click( submitButton );
			expect( queryByText( 'Edit' ) ).not.toBeInTheDocument();
		} );

		it( 'renders the payment method submitButton', () => {
			const { getByText } = render( <MyCheckout /> );
			expect( getByText( 'Pay Please' ) ).toBeTruthy();
		} );

		it( 'renders the payment method submitButton disabled if any steps are incomplete and the last step is not active', () => {
			const { getByText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 1 ], steps[ 2 ] ] } />
			);
			expect( getByText( 'Pay Please' ) ).toBeDisabled();
		} );

		it( 'renders the payment method submitButton enabled if any steps are incomplete and the last step is active', () => {
			const { getByText } = render( <MyCheckout steps={ [ steps[ 0 ], steps[ 3 ] ] } /> );
			expect( getByText( 'Pay Please' ) ).not.toBeDisabled();
		} );

		it( 'renders the payment method submitButton disabled if all steps are complete but the last step is not active', () => {
			const { getByText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 1 ], steps[ 2 ] ] } />
			);
			expect( getByText( 'Pay Please' ) ).toBeDisabled();
		} );

		it( 'renders the payment method submitButton active if all steps are complete and the last step is active', () => {
			const { getByText } = render( <MyCheckout steps={ [ steps[ 0 ], steps[ 1 ] ] } /> );
			expect( getByText( 'Pay Please' ) ).not.toBeDisabled();
		} );

		it( 'provides useIsStepComplete that changes based on isCompleteCallback', async () => {
			const { getAllByText, getByText, getByLabelText } = render(
				<MyCheckout steps={ [ steps[ 4 ], steps[ 1 ] ] } />
			);
			expect( getByText( 'Possibly Complete isComplete false' ) ).toBeInTheDocument();
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const user = userEvent.setup();
			await user.click( firstStepContinue );
			await user.type( getByLabelText( 'User Name' ), 'Lyra' );
			// isComplete does not update until we press continue
			await user.click( firstStepContinue );
			await waitFor( () => {
				expect( getByText( 'Possibly Complete isComplete true' ) ).toBeInTheDocument();
			} );
		} );
	} );

	describe( 'submitting the form', function () {
		let MyCheckout;
		const submitButtonComponent = <MockSubmitButtonSimple />;
		const mockMethod = createMockMethod( { submitButton: submitButtonComponent } );
		const steps = createMockStepObjects();

		beforeEach( () => {
			MyCheckout = ( props ) => {
				const [ paymentData, setPaymentData ] = useState( {} );
				const { stepObjectsWithStepNumber, stepObjectsWithoutStepNumber } =
					createStepsFromStepObjects( props.steps || steps );
				const createStepFromStepObject = createStepObjectConverter( paymentData );
				return (
					<myContext.Provider value={ [ paymentData, setPaymentData ] }>
						<CheckoutProvider
							paymentMethods={ [ mockMethod ] }
							paymentProcessors={ { mock: props.paymentProcessor } }
							selectFirstAvailablePaymentMethod
						>
							<CheckoutStepGroup>
								{ stepObjectsWithoutStepNumber.map( createStepFromStepObject ) }
								{ stepObjectsWithStepNumber.map( createStepFromStepObject ) }
								<CheckoutFormSubmit validateForm={ props.validateForm } />
							</CheckoutStepGroup>
						</CheckoutProvider>
					</myContext.Provider>
				);
			};
		} );

		it( 'does not call the payment processor function if the validateForm callback is falsy', async () => {
			const validateForm = jest.fn();
			validateForm.mockResolvedValue( false );
			const processor = jest.fn().mockResolvedValue( makeErrorResponse( 'good' ) );
			render(
				<MyCheckout
					steps={ [ steps[ 0 ] ] }
					validateForm={ validateForm }
					paymentProcessor={ processor }
				/>
			);
			const submitButton = screen.getByText( 'Pay Please' );

			const user = userEvent.setup();
			await user.click( submitButton );

			expect( processor ).not.toHaveBeenCalled();
		} );

		it( 'calls the payment processor function if the validateForm callback is truthy', async () => {
			const validateForm = jest.fn();
			validateForm.mockResolvedValue( true );
			const processor = jest.fn().mockResolvedValue( makeErrorResponse( 'good' ) );
			render(
				<MyCheckout
					steps={ [ steps[ 0 ] ] }
					validateForm={ validateForm }
					paymentProcessor={ processor }
				/>
			);
			const submitButton = screen.getByText( 'Pay Please' );

			const user = userEvent.setup();
			await user.click( submitButton );

			expect( processor ).toHaveBeenCalled();
		} );

		it( 'calls the payment processor function if the validateForm callback undefined', async () => {
			const processor = jest.fn().mockResolvedValue( makeErrorResponse( 'good' ) );
			render( <MyCheckout steps={ [ steps[ 0 ] ] } paymentProcessor={ processor } /> );
			const submitButton = screen.getByText( 'Pay Please' );

			const user = userEvent.setup();
			await user.click( submitButton );

			expect( processor ).toHaveBeenCalled();
		} );
	} );
} );

function createMockMethodFactory() {
	let mockMethodIdCounter = 0;
	return function ( {
		submitButton = <MockSubmitButton content="Pay Please" />,
		activeContent = <MockPaymentForm />,
	} = {} ) {
		mockMethodIdCounter = mockMethodIdCounter + 1;
		const title = `Mock Payment Method ${ mockMethodIdCounter }`;
		return {
			id: 'mock' + mockMethodIdCounter,
			paymentProcessorId: 'mock',
			label: <span data-testid="mock-label">{ title }</span>,
			activeContent,
			submitButton,
			inactiveContent: title,
			getAriaLabel: () => title,
		};
	};
}

function MockSubmitButton( { disabled, content }: { disabled?: boolean; content: string } ) {
	const { setTransactionComplete, setTransactionPending } = useTransactionStatus();
	const process = usePaymentProcessor( 'mock' );
	const onClick = () => {
		setTransactionPending();
		process( true ).then( ( result ) => setTransactionComplete( result ) );
	};
	return (
		<button disabled={ disabled } onClick={ onClick }>
			{ content }
		</button>
	);
}

function MockPaymentForm( { summary } ) {
	const [ cardholderName, changeCardholderName ] = useState( '' );
	return (
		<div data-testid="mock-payment-form">
			<label>
				{ summary ? 'Name Summary' : 'Cardholder Name' }
				<input
					name="cardholderName"
					value={ cardholderName }
					onChange={ ( event ) => changeCardholderName( event.target.value ) }
				/>
			</label>
		</div>
	);
}

function MockSubmitButtonSimple( { disabled, onClick }: { disabled?: boolean; onClick: any } ) {
	return (
		<button disabled={ disabled } onClick={ onClick }>
			Pay Please
		</button>
	);
}

interface LineItem {
	type: string;
	id: string;
	label: string;
	amount: number;
}

function createMockItems(): { items: LineItem[]; total: LineItem } {
	const items = [
		{
			label: 'Illudium Q-36 Explosive Space Modulator',
			id: 'space-modulator',
			type: 'widget',
			amount: 5500,
		},
		{
			label: 'Air Jordans',
			id: 'sneakers',
			type: 'apparel',
			amount: 12000,
		},
	];
	const total = {
		label: 'Total',
		id: 'total',
		type: 'total',
		amount: 17500,
	};
	return { items, total };
}

function createStepsFromStepObjects( stepObjects ) {
	const stepObjectsWithoutStepNumber = stepObjects.filter(
		( stepObject ) => ! stepObject.hasStepNumber
	);
	const stepObjectsWithStepNumber = stepObjects.filter(
		( stepObject ) => stepObject.hasStepNumber
	);
	return {
		stepObjectsWithStepNumber,
		stepObjectsWithoutStepNumber,
	};
}

function createStepObjectConverter( paymentData ) {
	return function createStepFromStepObject( stepObject ) {
		if ( stepObject.hasStepNumber ) {
			return (
				<CheckoutStep
					activeStepContent={ stepObject.activeStepContent }
					completeStepContent={ stepObject.completeStepContent }
					titleContent={ stepObject.titleContent }
					stepId={ stepObject.id }
					key={ stepObject.id }
					isCompleteCallback={ () => stepObject.isCompleteCallback( { paymentData } ) }
					editButtonAriaLabel={ stepObject.getEditButtonAriaLabel() }
					nextStepButtonAriaLabel={ stepObject.getNextStepButtonAriaLabel() }
					className={ stepObject.className }
				/>
			);
		}
		return (
			<CheckoutStepBody
				errorMessage="error"
				editButtonAriaLabel={ stepObject.getEditButtonAriaLabel() }
				nextStepButtonAriaLabel={ stepObject.getNextStepButtonAriaLabel() }
				isStepActive={ false }
				isStepComplete
				stepNumber={ 1 }
				stepId={ stepObject.id }
				key={ stepObject.id }
				activeStepContent={ stepObject.activeStepContent }
				completeStepContent={ stepObject.completeStepContent }
				titleContent={ stepObject.titleContent }
				className={ stepObject.className }
			/>
		);
	};
}

function createMockStepObjects() {
	return [
		{
			id: 'custom-summary-step',
			className: 'custom-summary-step-class',
			hasStepNumber: false,
			titleContent: <span>Custom Step - Summary Title</span>,
			activeStepContent: <span>Custom Step - Summary Active</span>,
			completeStepContent: <span>Custom Step - Summary Complete</span>,
			isCompleteCallback: () => true,
			getEditButtonAriaLabel: () => 'Custom Step - Summary edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Summary next button label',
		},
		{
			id: 'custom-contact-step',
			className: 'custom-contact-step-class',
			hasStepNumber: true,
			titleContent: <span>Custom Step - Contact Title</span>,
			activeStepContent: <span>Custom Step - Contact Active</span>,
			completeStepContent: <span>Custom Step - Contact Complete</span>,
			isCompleteCallback: () => true,
			getEditButtonAriaLabel: () => 'Custom Step - Contact edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Contact next button label',
		},
		{
			id: 'custom-review-step',
			className: 'custom-review-step-class',
			hasStepNumber: true,
			titleContent: <span>Custom Step - Review Title</span>,
			activeStepContent: <span>Custom Step - Review Active</span>,
			completeStepContent: <span>Custom Step - Review Complete</span>,
			isCompleteCallback: () => true,
			getEditButtonAriaLabel: () => 'Custom Step - Review edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Review next button label',
		},
		{
			id: 'custom-incomplete-step',
			className: 'custom-incomplete-step-class',
			hasStepNumber: true,
			titleContent: <span>Custom Step - Incomplete Title</span>,
			activeStepContent: <span>Custom Step - Incomplete Active</span>,
			completeStepContent: <span>Custom Step - Incomplete Complete</span>,
			isCompleteCallback: () => false,
			getEditButtonAriaLabel: () => 'Custom Step - Incomplete edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Incomplete next button label',
		},
		{
			id: 'custom-possibly-complete-step',
			className: 'custom-possibly-complete-step-class',
			hasStepNumber: true,
			titleContent: <PossiblyCompleteTitle />,
			activeStepContent: <StepWithEditableField />,
			completeStepContent: <span>Custom Step - Possibly Complete Complete</span>,
			isCompleteCallback: ( { paymentData } ) => {
				return paymentData.userName && paymentData.userName.length > 0 ? true : false;
			},
			getEditButtonAriaLabel: () => 'Custom Step - Incomplete edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Incomplete next button label',
		},
		{
			id: 'custom-uneditable-step',
			className: 'custom-uneditable-step-class',
			hasStepNumber: true,
			titleContent: <span>Custom Step - Uneditable Title</span>,
			activeStepContent: <span>Custom Step - Uneditable Active</span>,
			completeStepContent: <span>Custom Step - Uneditable Complete</span>,
			isCompleteCallback: () => true,
			getEditButtonAriaLabel: () => 'Custom Step - Uneditable edit button label',
			getNextStepButtonAriaLabel: () => 'Custom Step - Uneditable next button label',
		},
	];
}

function PossiblyCompleteTitle() {
	const isComplete = useIsStepComplete();
	const text = `Possibly Complete isComplete ${ isComplete ? 'true' : 'false' }`;
	return (
		<div>
			<span>Custom Step - Possibly Complete Title</span>
			<span>{ text }</span>
		</div>
	);
}

function StepWithEditableField() {
	const [ paymentData, setPaymentData ] = usePaymentData();
	const onChange = ( event ) => {
		setPaymentData( { userName: event.target.value } );
	};
	const value = paymentData.userName || '';
	return (
		<div>
			<label htmlFor="username-field">User Name</label>
			<input id="username-field" type="text" value={ value } onChange={ onChange } />
		</div>
	);
}

function getMockPaymentProcessors(): Record< string, PaymentProcessorFunction > {
	return {
		mock: async () => ( { type: PaymentProcessorResponseType.SUCCESS, payload: true } ),
	};
}
