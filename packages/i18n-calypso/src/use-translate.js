/**
 * External dependencies
 */
import React from 'react';

export default function ( i18n ) {
	function bindTranslate() {
		const translate = i18n.translate.bind( i18n );
		Object.defineProperty( translate, 'localeSlug', { get: i18n.getLocaleSlug.bind( i18n ) } );
		return translate;
	}

	return function useTranslate() {
		const [ translate, setTranslate ] = React.useState( bindTranslate );

		React.useEffect( () => {
			const onChange = () => setTranslate( bindTranslate );
			i18n.on( 'change', onChange );
			return () => i18n.off( 'change', onChange );
		}, [] );

		return translate;
	};
}
