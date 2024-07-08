import { ComponentType, useCallback, useMemo, useState } from 'react';

export type FieldTypes = string | Array< string >;

type Validator< T > = ( field: T ) => string | null;

type ContextProps< T > = {
	checks?: Validator< T | undefined >[] | null;
	field?: T;
	error?: string;
};

function withErrorHandling< T, F extends FieldTypes >(
	WrappedComponent: ComponentType< T & ContextProps< F > >
): ComponentType< T & ContextProps< F > > {
	return ( props ) => {
		const { checks, field } = props;
		const [ error, setError ] = useState< string | undefined >( undefined );
		const newProps = useMemo( () => ( { ...props, error } ), [ props, error ] );

		const validate = useCallback( () => {
			if ( ! checks ) {
				return;
			}

			for ( const check of checks ) {
				const error = check( field );
				if ( error ) {
					setError( error );
					break;
				}
			}
		}, [ checks, field ] );

		const onFocus = () => {
			setError( undefined );
		};

		const onBlur = () => {
			validate();
		};

		return (
			<div onFocus={ onFocus } onBlur={ onBlur }>
				<WrappedComponent { ...newProps } />
			</div>
		);
	};
}

export default withErrorHandling;
