import { A4AOmnibarHomeIcon } from './omnibar-home-icon';

// Shown while a dashboard page loads, at the size of the default mark.
export function A4ALoadingLogo( props: React.SVGProps< SVGSVGElement > ) {
	return <A4AOmnibarHomeIcon width={ 64 } height={ 60 } { ...props } />;
}
