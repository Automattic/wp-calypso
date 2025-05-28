import metadata from '@automattic/components/metadata';
import Markdown from 'react-markdown';

interface PropsTableProps {
	component: string;
}

function PropsTable( { component }: PropsTableProps ) {
	if ( ! metadata[ component ] ) {
		return null;
	}

	const { props } = metadata[ component ];

	return (
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Description</th>
					<th>Type</th>
					<th>Default</th>
					<th>Required</th>
				</tr>
			</thead>
			<tbody>
				{ Object.entries( props ).map( ( [ key, value ] ) => (
					<tr key={ key }>
						<td width="15%">{ key }</td>
						<td width="40%">
							<Markdown>{ value.description }</Markdown>
						</td>
						<td width="15%">{ value.type.name }</td>
						<td width="15%">{ value.defaultValue?.value }</td>
						<td width="15%">{ value.required ? 'Yes' : 'No' }</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}

export default PropsTable;
