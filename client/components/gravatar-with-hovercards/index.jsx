import { Hovercards } from '@gravatar-com/hovercards/react';
import Gravatar from '../gravatar';
import '@gravatar-com/hovercards/dist/style.css';

export default function GravatarWithHovercards( props ) {
	return (
		<Hovercards>
			<Gravatar { ...props } />
		</Hovercards>
	);
}
