import { Animation } from '@automattic/components';

const { AnimatePresence, LazyMotion, m, loadFramerFeatures } = Animation;

interface Props {
	featureName: 'domMax' | 'domAnimation';
	children: ( args: typeof m ) => React.ReactNode;
}

const AnimateList = ( { featureName, children }: Props ) => (
	<LazyMotion features={ () => loadFramerFeatures( featureName ) } strict>
		{ /*@ts-expect-error AnimatePresence comes from a 3rd party, but its types don't include children on Props yet.*/ }
		<AnimatePresence initial={ false }>{ children( m ) }</AnimatePresence>
	</LazyMotion>
);

export default AnimateList;
