import { useSelector } from 'calypso/state';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

export const useUserEmail = (): string => useSelector( getCurrentUserEmail ) ?? '';
