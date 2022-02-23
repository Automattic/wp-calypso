import useOnboardingUrl from './use-onboarding-url';

export interface OnboardingUrlProviderProps {
	children: ( onboardingUrl: string ) => JSX.Element;
}

export default function OnboardingUrlProvider( {
	children,
}: OnboardingUrlProviderProps ): JSX.Element {
	const onboardingUrl = useOnboardingUrl();
	return children( onboardingUrl );
}
