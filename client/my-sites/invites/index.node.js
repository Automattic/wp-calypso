import { makeLayout } from 'calypso/controller';
import { setOembedProviderLink } from './controller';

export default ( router ) => {
	router( [ `/accept-invite/:site_id/:invitation_key` ], setOembedProviderLink, makeLayout );
};
