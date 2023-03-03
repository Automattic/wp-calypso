import { Animation } from '@automattic/components';

const { LazyMotion, m, loadFramerFeatures } = Animation;

interface Props {
	featureName: 'domMax' | 'domAnimation';
	children: ( m: any ) => JSX.Element | null;
}

const AnimatePresenceWithFeatures = ( { featureName, children }: Props ) => (
	<LazyMotion features={ () => loadFramerFeatures( featureName ) } strict>
		{ children( m ) }
	</LazyMotion>
);

export default AnimatePresenceWithFeatures;
