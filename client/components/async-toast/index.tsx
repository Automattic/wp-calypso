import { useContext } from 'react';
import { AsyncToastContext } from './context';
import type { FC, ComponentType } from 'react';

export function withAsyncToast< ComponentProps >(
	WrappedComponent: ComponentType< ComponentProps >
): FC< ComponentProps > {
	return function WithAsyncToast( props ) {
		return (
			<AsyncToastContext.Consumer>
				{ ( toasts ) => <WrappedComponent { ...props } asyncToastsFloop={ toasts } /> }
			</AsyncToastContext.Consumer>
		);
	};
}

export const useAsyncToast = () => {
	return useContext( AsyncToastContext );
};
