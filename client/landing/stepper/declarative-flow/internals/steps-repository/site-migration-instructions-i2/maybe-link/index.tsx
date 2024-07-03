import { type FC, AnchorHTMLAttributes, ReactNode, cloneElement } from 'react';

export const MaybeLink: FC<
	AnchorHTMLAttributes< HTMLAnchorElement > & { fallback: ReactNode }
> = ( { children, fallback, ...props } ) => {
	if ( props.href ) {
		return <a { ...props }>{ children }</a>;
	}
	return cloneElement( fallback as JSX.Element, { children, ...props } );
};
