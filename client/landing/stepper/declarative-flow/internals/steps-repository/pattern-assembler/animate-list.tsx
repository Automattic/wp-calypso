import { Animation } from '@automattic/components';

const { AnimatePresence, LazyMotion, m, loadFramerFeatures } = Animation;

interface Props {
	featureName: 'domMax' | 'domAnimation';
	children: ( m: any ) => JSX.Element;
}

const AnimateList = ( { featureName, children }: Props ) => (
	<LazyMotion features={ () => loadFramerFeatures( featureName ) } strict>
		<AnimatePresence initial={ false }>{ children( m ) }</AnimatePresence>
	</LazyMotion>
);

export default AnimateList;
