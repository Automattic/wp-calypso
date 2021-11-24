import page from 'page';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { StepSlug } from '../types';

interface StepNavContextValue {
	push: ( step: StepSlug ) => void;
	pop: () => void;
	hasNoBackInStack: () => boolean;
	peekPreviousStep: () => StepSlug;
}

const stepNavContext = createContext< StepNavContextValue >( {
	push: () => undefined,
	pop: () => undefined,
	hasNoBackInStack: () => true,
	peekPreviousStep: () => undefined,
} );

export function StepNavProvider( {
	children,
	currentStep,
}: {
	children?: React.ReactNode;
	currentStep: StepSlug;
} ): React.ReactElement {
	const Provider = stepNavContext.Provider;

	const [ stack, setStackLocal ] = useState< StepSlug[] >( () => {
		const storedStack = sessionStorage.getItem( 'a8c-setup-nav-stack' );
		if ( ! storedStack ) {
			return [ currentStep ];
		}

		const previousStack = JSON.parse( storedStack ).map( ( s: string ) =>
			s === 'UNDEFINED' ? undefined : s
		);
		if ( previousStack.length && previousStack[ previousStack.length - 1 ] === currentStep ) {
			return previousStack;
		}

		return [ currentStep ];
	} );

	const setStack = useCallback( ( stack: StepSlug[] ) => {
		sessionStorage.setItem(
			'a8c-setup-nav-stack',
			JSON.stringify( stack.map( ( s ) => ( typeof s === 'undefined' ? 'UNDEFINED' : s ) ) )
		);
		setStackLocal( stack );
	}, [] );

	useEffect( () => {
		if ( currentStep !== stack[ stack.length - 1 ] ) {
			stack.push( currentStep );
			setStack( stack );
		}
	}, [ currentStep, stack, setStack ] );

	const contextValue = useMemo(
		() => ( {
			push: ( step: StepSlug ) => {
				stack.push( step );
				setStack( stack );
			},
			pop: () => {
				stack.pop();
				setStack( stack );
			},
			hasNoBackInStack: () => stack.length < 2,
			peekPreviousStep: () => stack[ stack.length - 2 ],
		} ),
		[ stack, setStack ]
	);

	return <Provider value={ contextValue }>{ children }</Provider>;
}

export function useStepHref(): ( step: StepSlug ) => string {
	const siteSlug = useSelector( getSelectedSiteSlug );

	return useCallback(
		( step: StepSlug ) => {
			if ( step ) {
				return `/setup/${ step }/${ siteSlug }`;
			}
			return `/setup/${ siteSlug }`;
		},
		[ siteSlug ]
	);
}

export function useStepNav(): ( step: StepSlug ) => void {
	const stepHref = useStepHref();

	return useCallback(
		( step: StepSlug ) => {
			page( stepHref( step ) );
		},
		[ stepHref ]
	);
}

export function useStepBackHref( { defaultBack }: { defaultBack: StepSlug } ): () => string {
	const stepHref = useStepHref();
	const stack = useContext( stepNavContext );

	return useCallback( () => {
		if ( stack.hasNoBackInStack() ) {
			return stepHref( defaultBack );
		}
		return stepHref( stack.peekPreviousStep() );
	}, [ defaultBack, stepHref, stack ] );
}

export function useStepBackNav( { defaultBack }: { defaultBack: StepSlug } ): () => void {
	const stepHref = useStepBackHref( { defaultBack } );
	const navStack = useContext( stepNavContext );

	return useCallback( () => {
		page( stepHref() );
		navStack.pop();
	}, [ stepHref, navStack ] );
}
