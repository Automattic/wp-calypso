import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { ComponentType, useCallback, useMemo, useState } from 'react';
import { isValidUrl } from 'calypso/a8c-for-agencies/sections/partner-directory/utils/tools';

type Checks = 'non-empty' | 'email' | 'url';

type FieldTypes = string | Array< string >;

type ContextProps< T > = {
	checks?: Checks[] | null;
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
		const translate = useTranslate();

		const validate = useCallback( () => {
			if ( ! checks ) {
				return;
			}

			for ( const check of checks ) {
				if ( check === 'non-empty' && ! field?.length ) {
					setError( translate( 'Field should not be empty' ) );
					break;
				}
				if ( check === 'email' ) {
					if ( ! field || typeof field !== 'string' || ! emailValidator.validate( field ) ) {
						setError( translate( 'Please provide correct email' ) );
						break;
					}
				}
				if ( check === 'url' && !! field?.length ) {
					if ( ! field || typeof field !== 'string' || ! isValidUrl( field ) ) {
						setError( translate( 'Please provide correct URL' ) );
						break;
					}
				}
			}
		}, [ checks, field, translate ] );

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
