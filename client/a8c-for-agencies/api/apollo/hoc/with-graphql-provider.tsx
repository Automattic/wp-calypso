import { ApolloProvider } from '@apollo/client';
import React from 'react';
import client from '../index';

export function withGraphqlProvider< P extends object >(
	WrappedComponent: React.ComponentType< P >
): React.FC< P > {
	return function WithGraphqlProvider( props: P ) {
		return (
			<ApolloProvider client={ client }>
				<WrappedComponent { ...props } />
			</ApolloProvider>
		);
	};
}
