import RamboFirstBloodII from './rambo-first-blood-ii';
import type { Step } from '../types';

const slug = 'rambo-first-blood';

const RamboFirstBlood: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<section>
				<p>Rambo First Blood</p>
				{ onNext && <button onClick={ () => onNext( RamboFirstBloodII.slug ) }>Done</button> }
			</section>
		);
	},
};

export default RamboFirstBlood;
