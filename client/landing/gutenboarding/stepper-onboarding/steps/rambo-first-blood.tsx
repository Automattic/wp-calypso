import RamboFirstBloodII from './rambo-first-blood-ii';
import type { Step } from '../types';

const slug = 'rambo-first-blood';

const RamboFirstBlood: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<>
				<div>Rambo First Blood</div>
				{ onNext && <button onClick={ () => onNext( RamboFirstBloodII.slug ) }>Next</button> }
			</>
		);
	},
};

export default RamboFirstBlood;
