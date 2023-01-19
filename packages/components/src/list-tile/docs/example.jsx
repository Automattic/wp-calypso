import { useHappinessEngineersQuery } from '@automattic/data-stores';
import { Gravatar } from '../../gravatar';
import Gridicon from '../../gridicon';
import { ListTile } from '../index';

export default function ListTileExample() {
	const { data } = useHappinessEngineersQuery();
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
				leading={ <Gravatar user={ data } size={ 42 } /> }
				trailing={
					<div style={ { marginTop: '-20px', marginRight: '-20px' } }>
						<Gridicon icon="info" size={ 24 } />{ ' ' }
					</div>
				}
			/>
		</div>
	);
}
