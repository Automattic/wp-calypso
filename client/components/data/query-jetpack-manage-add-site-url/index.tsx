import { useDispatch, useSelector } from 'calypso/state';
import { checkUrl } from 'calypso/state/jetpack-connect/actions/check-url';
import { getConnectingSite } from 'calypso/state/jetpack-connect/selectors';

interface Props {
	url: string;
	onSuccess: ( data: object ) => void;
	onError?: ( data: object ) => void;
}

export default function QueryJetpackManageAddSiteUrl( { url, onSuccess }: Props ) {
	const dispatch = useDispatch();
	const connectingSite = useSelector( getConnectingSite );

	if ( url && ! connectingSite.isFetching ) {
		dispatch( checkUrl( url ) );
		return null;
	}

	if ( connectingSite.isFetched ) {
		onSuccess( connectingSite.data );
		return null;
	}

	return null;
}
