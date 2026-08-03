import Animate from '../index';

function AnimateExample( {
	exampleCode = (
		<Animate type="appear">
			This content will animate on rendering. You may have to reload the page to see the effect.
		</Animate>
	),
} ) {
	return exampleCode;
}

Animate.displayName = 'Animate';
AnimateExample.displayName = 'Animate';

export default AnimateExample;
