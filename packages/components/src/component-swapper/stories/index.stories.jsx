import ComponentSwapper from '../.';
import { Button } from '../../.';

export default { title: 'Unaudited/Component swapper' };

const ComponentSwapperVariations = () => {
	return (
		<div>
			<h1>660px example</h1>
			<ComponentSwapper
				// eslint-disable-next-line no-console
				onSwap={ () => console.log( 'swapping' ) }
				breakpoint="<660px"
				breakpointActiveComponent={ <Button primary>Active breakpoint - primary button</Button> }
				breakpointInactiveComponent={ <Button>Inactive breakpoint - regular button</Button> }
			>
				<div style={ { padding: '10px 0' } }> Example child node </div>
			</ComponentSwapper>
		</div>
	);
};

export const Default = () => <ComponentSwapperVariations />;
