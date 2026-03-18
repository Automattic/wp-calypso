import { useA4AContextQuery } from '../data/agency/use-a4a-context-query';
import { useAuth } from './auth';
import { useAppContext } from './context';

export default function A4AContextProvider( { children }: { children: React.ReactNode } ) {
	const { user } = useAuth();
	const { name } = useAppContext();

	useA4AContextQuery( Boolean( user && name === 'A4A' ) );

	return children;
}
