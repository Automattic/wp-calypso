/**
 * External dependencies
 */
import React from 'react';

export default function( i18n ) {
	const translate = i18n.translate.bind( i18n );
	const getLocaleSlug = i18n.getLocaleSlug.bind( i18n );

	return function useTranslate() {
		const [ localeSlug, setLocaleSlug ] = React.useState( getLocaleSlug );

		React.useEffect(() => {
			const onChange = () => setLocaleSlug( getLocaleSlug() );
			i18n.on( 'change', onChange );
			return () => i18n.off( 'change', onChange );
		}, []);

		return [ translate, localeSlug ];
	};
}
