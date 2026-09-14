import { ReaderTeam } from '@automattic/api-core';
import { readTeamsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ComponentType } from 'react';

export interface WithReaderTeamsProps {
	teams: ReaderTeam[];
}

const EMPTY: ReaderTeam[] = [];

/**
 * HOC that fetches reader teams using react-query and injects them as the
 * `teams` prop on the wrapped component.
 */
export function withReaderTeams< P extends WithReaderTeamsProps >(
	WrappedComponent: ComponentType< P >
): ComponentType< Omit< P, keyof WithReaderTeamsProps > > {
	const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

	function WithReaderTeams( props: Omit< P, keyof WithReaderTeamsProps > ) {
		const { data } = useQuery( readTeamsQuery() );
		const teams = data?.teams ?? EMPTY;

		return <WrappedComponent { ...( props as P ) } teams={ teams } />;
	}

	WithReaderTeams.displayName = `withReaderTeams(${ displayName })`;
	return WithReaderTeams;
}
