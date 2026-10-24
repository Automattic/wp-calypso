import ConnectIllustration from './connect-illustration';
import ConstructionIllustration from './construction-illustration';
import TruckIllustration from './truck-illustration';

export default function EntryIllustration( {
	kind,
	plugMotionReplay,
}: {
	kind: 'connect' | 'move' | 'create';
	plugMotionReplay?: number;
} ) {
	if ( kind === 'connect' ) {
		return <ConnectIllustration replay={ plugMotionReplay } />;
	}
	if ( kind === 'move' ) {
		return <TruckIllustration />;
	}

	return <ConstructionIllustration />;
}
