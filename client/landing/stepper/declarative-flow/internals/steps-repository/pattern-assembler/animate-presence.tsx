import { Animation } from '@automattic/components';

const { AnimatePresence: MotionAnimatePresence, LazyMotion, m, loadFramerFeatures } = Animation;

interface Props {
	children: ( m: any ) => JSX.Element | null;
}

const AnimatePresence = ( { children }: Props ) => (
	<LazyMotion features={ () => loadFramerFeatures( 'domMax' ) } strict>
		<MotionAnimatePresence initial={ false }>{ children( m ) }</MotionAnimatePresence>
	</LazyMotion>
);

export default AnimatePresence;
