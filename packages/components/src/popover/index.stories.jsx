import { useEffect, useRef, useState } from 'react';
import Popover from '.';

export default { title: 'Unaudited/Popover' };

const Container = ( props ) => {
	const [ currentRef, setCurrentRef ] = useState( undefined );
	const ref = useRef( undefined );
	useEffect( () => {
		setCurrentRef( ref.current );
	}, [] );
	return (
		<>
			<div ref={ ref } style={ { display: 'inline-block', border: '1px solid gray' } }>
				Target Element
			</div>
			<Popover
				className="theme-card__tooltip"
				context={ currentRef }
				isVisible
				showDelay={ 0 }
				{ ...props }
			>
				I am the description.
			</Popover>
		</>
	);
};

export const Basic = () => {
	return <Container />;
};
