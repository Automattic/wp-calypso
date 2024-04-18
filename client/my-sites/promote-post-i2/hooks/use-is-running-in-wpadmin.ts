import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isRunningInWpAdmin } from '../utils';

const useIsRunningInWpAdmin = (): boolean => {
	const site = useSelector( getSelectedSite );
	return isRunningInWpAdmin( site );
};

export default useIsRunningInWpAdmin;
