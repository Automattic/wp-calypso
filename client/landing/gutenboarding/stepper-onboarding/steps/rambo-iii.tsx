import RamboFirstBloodII from './rambo-first-blood-ii';

type StepOptions = Record< string, unknown >;

interface Step {
	slug: string;
	options?: StepOptions;
	Render: React.FunctionComponent< { onNext?: ( uid: string ) => void } >;
}

const slug = 'rambo-iii';

const RamboIII: Step = {
	slug,
	Render: ( { onNext } ) => {
		return (
			<>
				<div>Rambo III</div>
				{ onNext && <button onClick={ () => onNext( RamboFirstBloodII.slug ) }>Previous</button> }
			</>
		);
	},
};

export default RamboIII;
