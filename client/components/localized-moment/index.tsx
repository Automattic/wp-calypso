import moment from 'moment';
import { useContext, type ComponentType } from 'react';
import MomentContext from './context';

export interface WithLocalizedMomentProps {
	moment: typeof moment;
	momentLocale: string;
}

/**
 * HOC that injects a locale-aware `moment` (and `momentLocale`) from
 * MomentContext as props on the wrapped component.
 */
export function withLocalizedMoment< P >(
	WrappedComponent: ComponentType< P >
): ComponentType< Omit< P, keyof WithLocalizedMomentProps > > {
	const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

	function WithLocalizedMoment( props: Omit< P, keyof WithLocalizedMomentProps > ) {
		const momentState = useContext( MomentContext );
		return <WrappedComponent { ...( props as P ) } { ...momentState } />;
	}

	WithLocalizedMoment.displayName = `withLocalizedMoment(${ displayName })`;
	return WithLocalizedMoment;
}

export const useLocalizedMoment = () => {
	const { moment } = useContext( MomentContext );
	return moment;
};
