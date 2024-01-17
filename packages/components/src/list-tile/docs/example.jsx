import { Gravatar } from '../../gravatar';
import Gridicon from '../../gridicon';
import { ListTile } from '../index';

const genericUser = {
	avatar_URL: 'https://0.gravatar.com/avatar/f9879d71855b5ff21e4963273a886bfc?s=96&d=mm',
	display_name: 'Bob The Tester',
};

export default function ListTileExample() {
	return (
		<div
			style={ {
				backgroundColor: 'white',
				width: '300px',
				border: '1px solid lightgray',
				padding: '16px',
			} }
		>
			<ListTile
				title="This is a title"
				subtitle="This is a subtitle"
				leading={ <Gravatar user={ genericUser } size={ 42 } /> }
				trailing={
					<div style={ { marginTop: '-20px', marginRight: '-20px' } }>
						<Gridicon icon="info" size={ 24 } />{ ' ' }
					</div>
				}
			/>
		</div>
	);
}
