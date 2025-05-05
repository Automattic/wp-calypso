import { forwardRef, useContext, useEffect, useMemo, useState } from 'react';
import I18NContext from './context';

function bindI18nProps( i18n ) {
	return {
		translate: i18n.translate.bind( i18n ),
		locale: i18n.getLocaleSlug(),
	};
}

/**
 * Localize a React component
 * @param  {import('react').Component} ComposedComponent React component to localize
 * @returns {import('react').Component} The localized component
 */
export default function localize( ComposedComponent ) {
	const LocalizedComponent = forwardRef( ( props, ref ) => {
		const i18n = useContext( I18NContext );
		const [ counter, setCounter ] = useState( 0 );
		useEffect( () => {
			const onChange = () => setCounter( ( c ) => c + 1 );
			i18n.on( 'change', onChange );
			return () => i18n.off( 'change', onChange );
		}, [ i18n ] );

		const i18nProps = useMemo( () => bindI18nProps( i18n, counter ), [ i18n, counter ] );

		return <ComposedComponent { ...props } { ...i18nProps } ref={ ref } />;
	} );

	const componentName = ComposedComponent.displayName || ComposedComponent.name || '';
	LocalizedComponent.displayName = 'Localized(' + componentName + ')';

	return LocalizedComponent;
}
