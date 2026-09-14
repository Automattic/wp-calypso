import { ReaderOrganization } from '@automattic/api-core';
import { readOrganizationsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ComponentType } from 'react';

export interface WithReaderOrganizationsProps {
	organizations: ReaderOrganization[];
}

const EMPTY: ReaderOrganization[] = [];

/**
 * HOC that fetches reader organizations using react-query and injects them as the
 * `organizations` prop on the wrapped component.
 */
export function withReaderOrganizations< P extends WithReaderOrganizationsProps >(
	WrappedComponent: ComponentType< P >
): ComponentType< Omit< P, keyof WithReaderOrganizationsProps > > {
	const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

	function WithReaderOrganizations( props: Omit< P, keyof WithReaderOrganizationsProps > ) {
		const { data } = useQuery( readOrganizationsQuery() );
		const organizations = data?.organizations ?? EMPTY;

		return <WrappedComponent { ...( props as P ) } organizations={ organizations } />;
	}

	WithReaderOrganizations.displayName = `withReaderOrganizations(${ displayName })`;
	return WithReaderOrganizations;
}
