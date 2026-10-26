import ConnectIllustration from './connect-illustration';
import ConstructionIllustration from './construction-illustration';
import TruckIllustration from './truck-illustration';

export default function EntryIllustration( { kind }: { kind: 'connect' | 'move' | 'create' } ) {
	if ( kind === 'connect' ) {
		return <ConnectIllustration />;
	}
	if ( kind === 'move' ) {
		return <TruckIllustration />;
	}

	return <ConstructionIllustration />;
}
