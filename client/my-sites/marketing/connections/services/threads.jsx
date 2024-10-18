import { SharingService, connectFor } from 'calypso/my-sites/marketing/connections/service';

export class Threads extends SharingService {}

export default connectFor( Threads, ( state, props ) => props );
