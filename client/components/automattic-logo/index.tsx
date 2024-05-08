import clsx from 'clsx';
import { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	className?: string;
	size?: number;
}

const AutomatticLogo: FunctionComponent< Props > = ( { className, size = 96 } ) => (
	<svg className={ clsx( 'automattic-logo', className ) } height={ size } viewBox="0 0 792 96">
		<path d="M292.1,80.5c-19.4,0-31.9-13.9-31.9-28.5v-1.8c0-14.8,12.6-28.5,31.9-28.5c19.4,0,32,13.7,32,28.5V52C324.1,66.5,311.6,80.5,292.1,80.5z M313.8,50.3c0-10.6-7.7-20-21.7-20s-21.6,9.4-21.6,20v1.3c0,10.6,7.6,20.2,21.6,20.2s21.7-9.6,21.7-20.2V50.3z" />
		<path d="M73.5,78.3l-7.2-13.5H34.2l-7,13.5H16.4L46,23.7h8.5l30,54.6H73.5z M50,34.4l-11.9,23h24.2L50,34.4z" />
		<path d="M131.1,80.5c-19.6,0-28.7-10.7-28.7-24.9V23.7h10.2v32.1c0,10.1,6.6,16.1,19.3,16.1c13,0,18.3-6,18.3-16.1V23.7h10.3v31.9C160.4,69.1,151.7,80.5,131.1,80.5z" />
		<path d="M217.5,32.2v46.1h-10.3V32.2h-23.9v-8.5h58v8.5H217.5z" />
		<path d="M415.5,78.3V35.1l-2.7,4.8l-22.9,38.5h-5l-22.6-38.5l-2.7-4.8v43.2h-10V23.7h14.2l21.6,37.5l2.5,4.6l2.5-4.6l21.3-37.5h14v54.6H415.5z" />
		<path d="M503.3,78.3L496,64.8H464l-7,13.5h-10.8l29.5-54.6h8.5l30,54.6H503.3z M479.7,34.4l-11.9,23H492L479.7,34.4z" />
		<path d="M555.6,32.2v46.1h-10.3V32.2h-23.9v-8.5h58v8.5H555.6z" />
		<path d="M630.8,32.2v46.1h-10.3V32.2h-23.9v-8.5h58v8.5H630.8z" />
		<path d="M679.9,78.3V28.9c4.1,0,5.7-2.2,5.7-5.2h4.3v54.6H679.9z" />
		<path d="M770.3,39.1c-4.9-4.5-12.1-8.8-21.9-8.8c-14.6,0-22.8,10-22.8,20.4v1.1c0,10.3,8.3,20,23.5,20c9.1,0,16.7-4.3,21.4-8.8l6.2,6.5c-6,5.9-16.2,10.9-28.2,10.9c-20.7,0-33.2-13.5-33.2-28.2v-1.8c0-14.8,13.7-28.7,33.7-28.7c11.6,0,22.1,4.8,27.7,10.9L770.3,39.1z" />
		<path d="M298.9,40.7c1.8,1.2,2.4,3.7,1.2,5.5l-9.4,14.5c-1.2,1.9-3.7,2.4-5.5,1.2l0,0c-1.8-1.2-2.4-3.7-1.2-5.5l9.4-14.5C294.6,40.1,297,39.5,298.9,40.7L298.9,40.7z" />
	</svg>
);

export default AutomatticLogo;
