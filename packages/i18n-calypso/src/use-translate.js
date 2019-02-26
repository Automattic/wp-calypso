/**
 * External dependencies
 */
import React from 'react';

export default function( i18n ) {
	const translate = i18n.translate.bind( i18n );

	return function useTranslate() {
		const [ localeSlug, setLocaleSlug ] = React.useState( i18n.getLocaleSlug() );

		const onChange = () => setLocaleSlug( i18n.getLocaleSlug() );

		React.useEffect(() => {
			i18n.on( 'change', onChange );
			return () => i18n.off( 'change', onChange );
		}, []);

		return [ translate, localeSlug ];
	};
}
