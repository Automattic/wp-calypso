import { useState, useEffect, useCallback } from 'react';
import { getPageSlug, getProgressStepList } from './step-definitions';
import type { ModeType, StepType, StepSlug } from './constants';
import type { StepsDefinition, StepComponentProps, ProgressStepList } from './types';

interface ConnectDomainStepsProps {
	domain: string;
	initialPageSlug: StepSlug;
	onSetPage?: ( pageSlug: StepSlug ) => void;
	stepsDefinition: StepsDefinition;
	queryError?: string;
	queryErrorDescription?: string;
	[ key: string ]: unknown;
}

export default function ConnectDomainSteps( {
	domain,
	initialPageSlug,
	onSetPage,
	stepsDefinition,
	queryError,
	queryErrorDescription,
	...stepProps
}: ConnectDomainStepsProps ) {
	const [ mode, setMode ] = useState< ModeType >( stepsDefinition[ initialPageSlug ].mode );
	const [ step, setStep ] = useState< StepType >( stepsDefinition[ initialPageSlug ].step );
	const [ pageSlug, setPageSlug ] = useState< StepSlug >( initialPageSlug );
	const [ progressStepList, setProgressStepList ] = useState< ProgressStepList >( {} );

	const StepComponent = stepsDefinition?.[ pageSlug ]?.component;

	const setPage = useCallback(
		( pageStepSlug: StepSlug ) => {
			setPageSlug( pageStepSlug );
			onSetPage?.( pageStepSlug );
			setStep( stepsDefinition[ pageStepSlug ].step );
			setMode( stepsDefinition[ pageStepSlug ].mode );
		},
		[ onSetPage, stepsDefinition ]
	);

	const setNextStep = useCallback( () => {
		const next = stepsDefinition[ pageSlug ]?.next;
		if ( next ) {
			setPage( next );
		}
	}, [ pageSlug, setPage, stepsDefinition ] );

	useEffect( () => {
		setPage( initialPageSlug );
	}, [ initialPageSlug, setPage ] );

	useEffect( () => {
		const resolvedPageSlug = getPageSlug( mode, step, stepsDefinition );
		if ( resolvedPageSlug ) {
			setPageSlug( resolvedPageSlug as StepSlug );
		}
	}, [ mode, step, stepsDefinition ] );

	useEffect( () => {
		setProgressStepList( getProgressStepList( mode, stepsDefinition ) );
	}, [ mode, stepsDefinition ] );

	if ( ! StepComponent ) {
		// TODO: handle this better
		return null;
	}

	const stepComponentProps: StepComponentProps = {
		domain,
		step,
		mode,
		onNextStep: setNextStep,
		progressStepList,
		pageSlug,
		setPage,
		queryError,
		queryErrorDescription,
		...( stepProps as Omit<
			StepComponentProps,
			| 'domain'
			| 'step'
			| 'mode'
			| 'onNextStep'
			| 'progressStepList'
			| 'pageSlug'
			| 'setPage'
			| 'queryError'
			| 'queryErrorDescription'
		> ),
	};

	return <StepComponent { ...stepComponentProps } />;
}
