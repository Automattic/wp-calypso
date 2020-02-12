/**
 * External dependencies
 */
import * as React from 'react';
import { __, _n, _nx, _x } from '@wordpress/i18n';

export const I18nContext = React.createContext< undefined | string >( undefined );

export interface I18nProps {
	__: typeof __;
	_n: typeof _n;
	_nx: typeof _nx;
	_x: typeof _x;
}

/**
 * React hook providing i18n translate functions
 *
 * @example
 *
 * import { useI18n } from '@automattic/react-i18n';
 * function MyComponent() {
 *   const { __ } = useI18n();
 *   return <div>{ __( 'Translate me.', 'text-domain' ) }</div>;
 * }
 */
export const useI18n = (): I18nProps => {
	const lang = React.useContext( I18nContext );
	const [ i18n, setI18n ] = React.useState< I18nProps >( makeI18n );
	React.useEffect( () => setI18n( makeI18n ), [ lang ] );
	return i18n;
};

/**
 * Remove from T the keys that are in common with K
 */
type Optionalize< T extends K, K > = Omit< T, keyof K >;

/**
 * React hook providing i18n translate functions
 *
 * @param WrappedComponent Component that will receive translate functions as props
 *
 * @example
 *
 * import { withI18n } from '@automattic/react-i18n';
 * function MyComponent( { __ } ) {
 *   return <div>{ __( 'Translate me.', 'text-domain' ) }</div>;
 * }
 * export default withI18n( MyComponent );
 */
export const withI18n = < T extends I18nProps = I18nProps >(
	WrappedComponent: React.ComponentType< T >
): React.FunctionComponent< Optionalize< T, I18nProps > > => props => (
	// Required cast `props as T`
	// See https://github.com/Microsoft/TypeScript/issues/28938
	<WrappedComponent { ...useI18n() } { ...( props as T ) } />
);

function makeI18n(): I18nProps {
	return { __, _n, _nx, _x };
}
