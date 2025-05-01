import { useContext } from 'react';
import { UserContext, type UserContextType } from '../context';

export function useUser(): UserContextType {
	return useContext( UserContext );
}
