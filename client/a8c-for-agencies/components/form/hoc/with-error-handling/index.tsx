import { ComponentType, useCallback, useMemo, useState, useEffect } from 'react';
import { FieldTypes } from './types';

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
		const [ error, setError ] = useState< string | undefined >( props.error );

		const newProps = useMemo( () => ( { ...props, error } ), [ props, error ] );
		if ( !! props.error && props.error !== newProps.error ) {
			setError( props.error );
		}

		// This is a workaround to ensure that the error is updated when the parent component updates the error.
		useEffect( () => {
			setError( props.error );
		}, [ props.error ] );

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
