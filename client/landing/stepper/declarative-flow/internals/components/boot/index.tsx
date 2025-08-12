import { useLocale } from '@automattic/i18n-utils';
import {
	type ComponentProps,
	Suspense,
	useEffect,
	useState,
	useTransition,
	type FC,
	type PropsWithChildren,
} from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';

interface Props extends PropsWithChildren {
	fallback: ComponentProps< typeof Suspense >[ 'fallback' ];
}

//* This component is used to ensure that all required data is loaded before rendering the children.
export const Boot: FC< Props > = ( { children, fallback } ) => {
	const [ isReady, setIsReady ] = useState( false );
	const [ isPending, setTransition ] = useTransition();

	const locale = useLocale();
	const newLocale = useFlowLocale();

	useEffect( () => {
		if ( ! isReady && newLocale === locale ) {
			setTransition( () => {
				setIsReady( true );
			} );
		}
	}, [ locale, newLocale, isReady ] );

	// Continue to show the fallback UI while we are still loading the new locale or when we're first transitioning to the new locale (i.e. the transition is still in process)
	if ( ! isReady || isPending ) {
		return fallback;
	}

	return <Suspense fallback={ fallback }>{ children }</Suspense>;
};
