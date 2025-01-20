import { useContext, useEffect, useState, useMemo } from 'react';
import I18NContext from './context';

function bindFixMe( i18n ) {
	return i18n.fixMe.bind( i18n );
}

/**
 * Returns a new binding to fixMe whenever internal i18n state/context changes
 */
export default function useFixMe() {
	const i18n = useContext( I18NContext );
	const [ counter, setCounter ] = useState( 0 );

	useEffect( () => {
		const onChange = () => setCounter( ( c ) => c + 1 );
		i18n.on( 'change', onChange );
		return () => i18n.off( 'change', onChange );
	}, [ i18n ] );

	return useMemo( () => bindFixMe( i18n, counter ), [ i18n, counter ] );
}
