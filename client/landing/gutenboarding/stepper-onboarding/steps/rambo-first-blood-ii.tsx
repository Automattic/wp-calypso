import RamboFirstBlood from './rambo-first-blood';
import RamboIII from './rambo-iii';
import type { Step } from '../types';

const slug = 'rambo-first-blood-ii';

const RamboFirstBloodII: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<>
				<div>Rambo First Blood II</div>
				{ onNext && <button onClick={ () => onNext( RamboFirstBlood.slug ) }>Previous</button> }
				{ onNext && <button onClick={ () => onNext( RamboIII.slug ) }>Next</button> }
			</>
		);
	},
};

export default RamboFirstBloodII;
