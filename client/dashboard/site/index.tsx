import { useParams } from 'react-router-dom';
import { findItemById } from '../data';

export default function Site() {
	const { id } = useParams();
	const item = findItemById( id );
	if ( item === undefined ) {
		return <p>No site found</p>;
	}

	return (
		<div>
			<h1>{ item.title } </h1>
		</div>
	);
}
