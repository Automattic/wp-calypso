import Search from '@automattic/search';
import { createHigherOrderComponent } from '@wordpress/compose';
import React from 'react';
import useTyper from 'calypso/landing/gutenboarding/hooks/use-typer';

const withUseTyper = createHigherOrderComponent( ( SearchComponent ) => {
	return ( props ) => {
		const placeholder = useTyper( [ '.com', '.com.br', '.net', '.org' ], true, {
			delayBetweenCharacters: 130,
		} );

		return <SearchComponent { ...props } placeholder={ 'mydomain' + placeholder } />;
	};
}, 'withUseTyper' );

export default withUseTyper( Search );
