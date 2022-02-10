import RamboIII from './rambo-iii';
import type { Step } from '../types';

const slug = 'rambo-first-blood-ii';

const RamboFirstBloodII: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<section>
				<p>Rambo First Blood II</p>
				{ onNext && <button onClick={ () => onNext( RamboIII.slug ) }>Done</button> }
			</section>
		);
	},
};

export default RamboFirstBloodII;
