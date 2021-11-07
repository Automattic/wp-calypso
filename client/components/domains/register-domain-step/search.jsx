import Search from '@automattic/search';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useState, useEffect } from 'react';
import useTyper from 'calypso/landing/gutenboarding/hooks/use-typer';
import { getAvailableTlds } from 'calypso/lib/domains';

const withUseTyper = createHigherOrderComponent( ( SearchComponent ) => {
	return ( props ) => {
		const [ tlds, setTlds ] = useState( [] );

		useEffect( () => {
			async function updateAvailableTlds() {
				const availableTlds = await getAvailableTlds();
				setTlds( availableTlds );
			}
			updateAvailableTlds();
		}, [] );
		const placeholder = useTyper( tlds, true, {
			delayBetweenCharacters: 130,
		} );

		return <SearchComponent { ...props } placeholder={ 'mydomain.' + placeholder } />;
	};
}, 'withUseTyper' );

export default withUseTyper( Search );
