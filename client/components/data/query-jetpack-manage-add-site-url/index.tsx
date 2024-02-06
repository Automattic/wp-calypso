import { useDispatch, useSelector } from 'calypso/state';
import { checkUrl } from 'calypso/state/jetpack-connect/actions/check-url';
import { getConnectingSite } from 'calypso/state/jetpack-connect/selectors';

export type JetpackManageAddSiteData = {
	exists: boolean;
	isWordPress: boolean;
	isJetpack: boolean;
	isJetpackConnected: boolean;
	isPrivate: boolean;
	isWPCOM: boolean;
};

interface Props {
	url: string;
	onSuccess: ( data: JetpackManageAddSiteData ) => void;
	onError?: ( data: object ) => void;
}

export default function QueryJetpackManageAddSiteUrl( { url, onSuccess }: Props ) {
	const dispatch = useDispatch();
	const connectingSite = useSelector( getConnectingSite );

	if ( connectingSite.isFetched ) {
		onSuccess( connectingSite.data as JetpackManageAddSiteData );
		return null;
	}

	if ( url && ! connectingSite.isFetching ) {
		dispatch( checkUrl( url ) );
		return null;
	}

	return null;
}
