import { useContext, useEffect, useMemo, useState } from 'react';
import I18NContext from './context';

function bindTranslate( i18n ) {
	const translate = i18n.translate.bind( i18n );
	Object.defineProperty( translate, 'localeSlug', { get: i18n.getLocaleSlug.bind( i18n ) } );
	return translate;
}

export default function useTranslate() {
	const i18n = useContext( I18NContext );
	const [ counter, setCounter ] = useState( 0 );

	useEffect( () => {
		const onChange = () => setCounter( ( c ) => c + 1 );
		return i18n.subscribe( onChange );
	}, [ i18n ] );

	return useMemo( () => bindTranslate( i18n, counter ), [ i18n, counter ] );
}
