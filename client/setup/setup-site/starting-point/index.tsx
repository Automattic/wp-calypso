import ImportedStartingPoint from 'calypso/signup/steps/starting-point/starting-point';
import { StartingPointFlag } from 'calypso/signup/steps/starting-point/types';
import { BackButton } from '../components/back-button';
import { useStepNav } from '../hooks/use-setup-nav';

export function StartingPoint(): React.ReactElement {
	const page = useStepNav();

	const handleSelect = ( startingPoint: StartingPointFlag ) => {
		if ( startingPoint === 'design' ) {
			page( 'design' );
		} else {
			throw new Error( 'not implemented' );
		}
	};

	return (
		<div>
			<BackButton defaultBack="site-options" />
			<ImportedStartingPoint onSelect={ handleSelect } />
		</div>
	);
}
