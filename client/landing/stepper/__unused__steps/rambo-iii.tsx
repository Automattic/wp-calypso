import RamboFirstBlood from './rambo-first-blood';
import type { Step } from '../types';

const slug = 'rambo-iii';

const RamboIII: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<section>
				<p>Rambo III</p>
				{ onNext && <button onClick={ () => onNext( RamboFirstBlood.slug ) }>Done</button> }
			</section>
		);
	},
};

export default RamboIII;
