import { useLocale } from '@automattic/i18n-utils';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import {
	type ComponentProps,
	Suspense,
	useEffect,
	useState,
	useTransition,
	type FC,
	type PropsWithChildren,
	useMemo,
} from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { getFlowFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';

interface Props extends PropsWithChildren {
	fallback: ComponentProps< typeof Suspense >[ 'fallback' ];
}

//* This component is used to ensure that all required data is loaded before rendering the children.
export const Boot: FC< Props > = ( { children, fallback } ) => {
	const [ isReady, setIsReady ] = useState( false );
	const [ isPending, setTransition ] = useTransition();

	const locale = useLocale();
	const newLocale = useFlowLocale();

	const [ isLoadingGoalsFirst ] = useGoalsFirstExperiment();
	const flowName = useMemo( () => getFlowFromURL(), [] );

	useEffect( () => {
		if (
			! isReady &&
			newLocale === locale &&
			( flowName !== ONBOARDING_FLOW || ! isLoadingGoalsFirst )
		) {
			setTransition( () => {
				setIsReady( true );
			} );
		}
	}, [ locale, newLocale, isReady, isLoadingGoalsFirst, flowName ] );

	// Continue to show the fallback UI while we are still loading the new locale or when we're first transitioning to the new locale (i.e. the transition is still in process)
	if ( ! isReady || isPending ) {
		return fallback;
	}

	return <Suspense fallback={ fallback }>{ children }</Suspense>;
};
