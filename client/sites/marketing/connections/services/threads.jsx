import { SharingService, connectFor } from '../service';

export class Threads extends SharingService {}

export default connectFor( Threads, ( state, props ) => props );
