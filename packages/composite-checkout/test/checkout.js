/**
 * External dependencies
 */
import React, { useState, useContext } from 'react';
import {
	render,
	getAllByLabelText as getAllByLabelTextInNode,
	getByText as getByTextInNode,
	queryByText as queryByTextInNode,
	fireEvent,
	act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

/**
 * Internal dependencies
 */
import {
	Checkout,
	CheckoutProvider,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutStepBody,
	CheckoutSteps,
	useSelect,
	useDispatch,
	useFormStatus,
	createRegistry,
	useRegisterStore,
	useIsStepComplete,
} from '../src/public-api';

const noop = () => {};
const myContext = React.createContext();
const usePaymentData = () => useContext( myContext );

describe( 'Checkout', () => {
	describe( 'using the default steps', function () {
		describe( 'using the default registry', function () {
			let MyCheckout;
			const mockMethod = createMockMethod();
			const { items, total } = createMockItems();

			beforeEach( () => {
				MyCheckout = () => (
					<CheckoutProvider
						locale="en-us"
						items={ items }
						total={ total }
						onPaymentComplete={ noop }
						showErrorMessage={ noop }
						showInfoMessage={ noop }
						showSuccessMessage={ noop }
						paymentMethods={ [ mockMethod ] }
					>
						<Checkout />
					</CheckoutProvider>
				);
			} );

			it( 'renders the line items and the total', () => {
				const { container } = render( <MyCheckout /> );

				// Product line items show the correct price
				getAllByLabelTextInNode( container, items[ 0 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 0 ].amount.displayValue )
				);
				getAllByLabelTextInNode( container, items[ 1 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 1 ].amount.displayValue )
				);

				// All elements labeled 'Total' show the expected price
				getAllByLabelTextInNode( container, total.label ).map( ( element ) =>
					expect( element ).toHaveTextContent( total.amount.displayValue )
				);
			} );

			it( 'renders the payment method label', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( 'Mock Label' )[ 0 ] ).toBeInTheDocument();
			} );

			it( 'renders the payment method activeContent', () => {
				const { getByTestId } = render( <MyCheckout /> );
				const activeComponent = getByTestId( 'mock-payment-form' );
				expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
			} );

			it( 'renders the review step', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 0 ].amount.displayValue ) ).toHaveLength( 1 );
				expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 1 ].amount.displayValue ) ).toHaveLength( 1 );
			} );

			it( 'renders the payment method submitButton', () => {
				const { getByText } = render( <MyCheckout /> );
				expect( getByText( 'Pay Please' ) ).toBeTruthy();
			} );
		} );

		describe( 'using a custom registry', function () {
			let MyCheckout;
			const mockMethod = createMockMethod();
			const { items, total } = createMockItems();

			beforeEach( () => {
				const registry = createRegistry();
				MyCheckout = () => (
					<CheckoutProvider
						locale="en-us"
						items={ items }
						total={ total }
						onPaymentComplete={ noop }
						showErrorMessage={ noop }
						showInfoMessage={ noop }
						showSuccessMessage={ noop }
						paymentMethods={ [ mockMethod ] }
						registry={ registry }
					>
						<Checkout />
					</CheckoutProvider>
				);
			} );

			it( 'renders the line items and the total', () => {
				const { container } = render( <MyCheckout /> );

				// Product line items show the correct price
				getAllByLabelTextInNode( container, items[ 0 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 0 ].amount.displayValue )
				);
				getAllByLabelTextInNode( container, items[ 1 ].label ).map( ( element ) =>
					expect( element ).toHaveTextContent( items[ 1 ].amount.displayValue )
				);

				// All elements labeled 'Total' show the expected price
				getAllByLabelTextInNode( container, total.label ).map( ( element ) =>
					expect( element ).toHaveTextContent( total.amount.displayValue )
				);
			} );

			it( 'renders the payment method label', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( 'Mock Label' )[ 0 ] ).toBeInTheDocument();
			} );

			it( 'renders the payment method activeContent', () => {
				const { getByTestId } = render( <MyCheckout /> );
				const activeComponent = getByTestId( 'mock-payment-form' );
				expect( activeComponent ).toHaveTextContent( 'Cardholder Name' );
			} );

			it( 'renders the review step', () => {
				const { getAllByText } = render( <MyCheckout /> );
				expect( getAllByText( items[ 0 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 0 ].amount.displayValue ) ).toHaveLength( 1 );
				expect( getAllByText( items[ 1 ].label ) ).toHaveLength( 2 );
				expect( getAllByText( items[ 1 ].amount.displayValue ) ).toHaveLength( 1 );
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
				const { items, total } = createMockItems();
				const MyCheckout = () => (
					<CheckoutProvider
						locale="en-us"
						items={ items }
						total={ total }
						onPaymentComplete={ noop }
						showErrorMessage={ noop }
						showInfoMessage={ noop }
						showSuccessMessage={ noop }
						paymentMethods={ [ mockMethod ] }
					>
						<Checkout />
					</CheckoutProvider>
				);
				const renderResult = render( <MyCheckout /> );
				container = renderResult.container;
			} );

			it( 'makes the review step active', () => {
				const activeSteps = container.querySelectorAll( '.checkout-step--is-active' );
				expect( activeSteps ).toHaveLength( 1 );
				expect( activeSteps[ 0 ] ).toHaveTextContent( 'Review your order' );
			} );

			it( 'makes the payment method step invisible', () => {
				const firstStep = container.querySelector( '.checkout__payment-methods-step' );
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

			beforeEach( () => {
				const mockMethod = createMockMethod();
				const { items, total } = createMockItems();
				const MyCheckout = () => (
					<CheckoutProvider
						locale="en-us"
						items={ items }
						total={ total }
						onPaymentComplete={ noop }
						showErrorMessage={ noop }
						showInfoMessage={ noop }
						showSuccessMessage={ noop }
						paymentMethods={ [ mockMethod ] }
					>
						<Checkout />
					</CheckoutProvider>
				);
				const renderResult = render( <MyCheckout /> );
				container = renderResult.container;
				const firstStepContinue = renderResult.getAllByText( 'Continue' )[ 0 ];
				fireEvent.click( firstStepContinue );
			} );

			it( 'makes the first step invisible', () => {
				const firstStep = container.querySelector( '.checkout__review-order-step' );
				const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
				expect( firstStepContent ).toHaveStyle( 'display: none' );
			} );

			it( 'makes the next step visible', () => {
				const reviewStep = container.querySelector( '.checkout__payment-methods-step' );
				const reviewStepContent = reviewStep.querySelector( '.checkout-steps__step-content' );
				expect( reviewStepContent ).toHaveStyle( 'display: block' );
			} );
		} );
	} );

	describe( 'with custom steps', function () {
		let MyCheckout;
		const mockMethod = createMockMethod();
		const { items, total } = createMockItems();
		const steps = createMockStepObjects();

		beforeEach( () => {
			MyCheckout = ( props ) => {
				const [ paymentData, setPaymentData ] = useState( {} );
				return (
					<myContext.Provider value={ [ paymentData, setPaymentData ] }>
						<CheckoutProvider
							locale="en-us"
							items={ items }
							total={ total }
							onPaymentComplete={ noop }
							showErrorMessage={ noop }
							showInfoMessage={ noop }
							showSuccessMessage={ noop }
							paymentMethods={ [ mockMethod ] }
						>
							<Checkout>
								{ createStepsFromStepObjects( props.steps || steps, paymentData ) }
							</Checkout>
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

		it( 'does not change steps if the continue button is clicked when the step is active and incomplete', () => {
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
			fireEvent.click( firstStepContinue );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'does change steps if the continue button is clicked when the step is active and complete', () => {
			const completeStep = { ...steps[ 0 ], hasStepNumber: true, isCompleteCallback: () => true };
			const { container, getAllByText } = render(
				<MyCheckout steps={ [ completeStep, steps[ 4 ], steps[ 1 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			const firstStep = container.querySelector( '.custom-summary-step-class' );
			const firstStepContent = firstStep.querySelector( '.checkout-steps__step-content' );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
			fireEvent.click( firstStepContinue );
			expect( firstStepContent ).toHaveStyle( 'display: none' );
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
			await act( async () => {
				await fireEvent.click( firstStepContinue );
			} );
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
			await act( async () => {
				await fireEvent.click( firstStepContinue );
			} );
			expect( firstStepContent ).toHaveStyle( 'display: none' );
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
			await act( async () => {
				await fireEvent.click( firstStepContinue );
			} );
			expect( firstStepContent ).toHaveStyle( 'display: block' );
		} );

		it( 'renders the continue button enabled if the step is active and complete', () => {
			const { container, getByLabelText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 4 ], steps[ 1 ] ] } />
			);

			fireEvent.change( getByLabelText( 'User Name' ), { target: { value: 'Lyra' } } );
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

		it( 'renders the edit button for editable steps with a lower index than the active step', () => {
			const { container, getAllByText } = render( <MyCheckout /> );
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			fireEvent.click( firstStepContinue );
			const step = container.querySelector( '.' + steps[ 1 ].className );
			expect( getByTextInNode( step, 'Edit' ) ).toBeInTheDocument();
		} );

		it( 'does not render the edit button if the form status is submitting', () => {
			const { queryByText, getAllByText } = render(
				<MyCheckout steps={ [ steps[ 0 ], steps[ 1 ], steps[ 2 ] ] } />
			);
			const firstStepContinue = getAllByText( 'Continue' )[ 0 ];
			fireEvent.click( firstStepContinue );
			expect( queryByText( 'Edit' ) ).toBeInTheDocument();
			const submitButton = getAllByText( 'Pay Please' )[ 0 ];
			fireEvent.click( submitButton );
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
			fireEvent.click( firstStepContinue );
			fireEvent.change( getByLabelText( 'User Name' ), { target: { value: 'Lyra' } } );
			await act( async () => {
				// isComplete does not update until we press continue
				await fireEvent.click( firstStepContinue );
			} );
			expect( getByText( 'Possibly Complete isComplete true' ) ).toBeInTheDocument();
		} );
	} );
} );

function createMockMethod() {
	return {
		id: 'mock',
		label: <span data-testid="mock-label">Mock Label</span>,
		activeContent: <MockPaymentForm />,
		submitButton: <MockSubmitButton />,
		inactiveContent: 'Mock Method',
		getAriaLabel: () => 'Mock Method',
	};
}

function MockSubmitButton( { disabled } ) {
	const { setFormSubmitting } = useFormStatus();
	const onClick = () => {
		setFormSubmitting();
	};
	return (
		<button disabled={ disabled } onClick={ onClick }>
			Pay Please
		</button>
	);
}

function MockPaymentForm( { summary } ) {
	useRegisterStore( 'mock', {
		reducer( state = {}, action ) {
			switch ( action.type ) {
				case 'CARDHOLDER_NAME_SET':
					return { ...state, cardholderName: action.payload };
			}
			return state;
		},
		actions: {
			changeCardholderName( payload ) {
				return { type: 'CARDHOLDER_NAME_SET', payload };
			},
		},
		selectors: {
			getCardholderName( state ) {
				return state.cardholderName || '';
			},
		},
	} );
	const cardholderName = useSelect( ( select ) => select( 'mock' ).getCardholderName() );
	const { changeCardholderName } = useDispatch( 'mock' );
	return (
		<div data-testid="mock-payment-form">
			<label>
				{ summary ? 'Name Summary' : 'Cardholder Name' }
				<input name="cardholderName" value={ cardholderName } onChange={ changeCardholderName } />
			</label>
		</div>
	);
}

function createMockItems() {
	const items = [
		{
			label: 'Illudium Q-36 Explosive Space Modulator',
			id: 'space-modulator',
			type: 'widget',
			amount: { currency: 'USD', value: 5500, displayValue: '$55' },
		},
		{
			label: 'Air Jordans',
			id: 'sneakers',
			type: 'apparel',
			amount: { currency: 'USD', value: 12000, displayValue: '$120' },
		},
	];
	const total = {
		label: 'Total',
		id: 'total',
		type: 'total',
		amount: { currency: 'USD', value: 17500, displayValue: '$175' },
	};
	return { items, total };
}

function createStepsFromStepObjects( stepObjects, paymentData ) {
	const createStepFromStepObject = createStepObjectConverter( paymentData );
	const stepObjectsWithoutStepNumber = stepObjects.filter(
		( stepObject ) => ! stepObject.hasStepNumber
	);
	const stepObjectsWithStepNumber = stepObjects.filter(
		( stepObject ) => stepObject.hasStepNumber
	);
	return (
		<React.Fragment>
			{ stepObjectsWithoutStepNumber.map( createStepFromStepObject ) }
			<CheckoutStepArea>
				<CheckoutSteps>{ stepObjectsWithStepNumber.map( createStepFromStepObject ) }</CheckoutSteps>
			</CheckoutStepArea>
		</React.Fragment>
	);
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
				errorMessage={ 'error' }
				editButtonAriaLabel={ stepObject.getEditButtonAriaLabel() }
				nextStepButtonAriaLabel={ stepObject.getNextStepButtonAriaLabel() }
				isStepActive={ false }
				isStepComplete={ true }
				stepNumber={ 1 }
				totalSteps={ 1 }
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
