/**
 * External dependencies
 */
import * as React from 'react';
import { __, _n, _nx, _x } from '@wordpress/i18n';

export const I18nContext = React.createContext< undefined | string >( undefined );

interface I18nTranslationFunctions {
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
 *   return <div>{ __( 'Translate me.' ) }</div>;
 * }
 */
export const useI18n = (): I18nTranslationFunctions => {
	const lang = React.useContext( I18nContext );
	const [ i18n, setI18n ] = React.useState< I18nTranslationFunctions >( makeI18n );
	React.useEffect( () => setI18n( makeI18n ), [ lang ] );
	return i18n;
};

/**
 * React hook providing i18n translate functions
 *
 * @param WrappedComponent Component that will receive translate functions as props
 *
 * @example
 *
 * import { withI18n } from '@automattic/react-i18n';
 * function MyComponent( { __ } ) {
 *   return <div>{ __( 'Translate me.' ) }</div>;
 * }
 * export default withI18n( MyComponent );
 */
export const withI18n = ( WrappedComponent: React.ComponentType ): React.ComponentType => {
	return class extends React.Component {
		render() {
			const i18n = useI18n();
			return <WrappedComponent { ...i18n } { ...this.props } />;
		}
	};
};

function makeI18n(): I18nTranslationFunctions {
	return { __, _n, _nx, _x };
}
