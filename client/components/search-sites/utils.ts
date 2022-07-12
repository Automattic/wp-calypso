import { get } from 'lodash';

const matches = < T >( item: T, term: string, keys: ( keyof T )[] ) =>
	keys.some( ( key ) => get( item, key, '' ).toLowerCase().indexOf( term ) > -1 );

export const searchCollection = < T >( collection: T[], term: string, keys: ( keyof T )[] ) =>
	collection.filter( ( item ) => matches( item, term, keys ) );
