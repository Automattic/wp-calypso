import { SharingService, connectFor } from 'calypso/my-sites/marketing/connections/service';

export class Bluesky extends SharingService {}

export default connectFor( Bluesky, ( state, props ) => props );
