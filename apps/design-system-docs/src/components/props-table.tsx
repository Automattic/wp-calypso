import metadata from '@automattic/components/metadata';
import { VisuallyHidden } from '@wordpress/components';
import Markdown from 'react-markdown';
import styles from './props-table.module.css';

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
				</tr>
			</thead>
			<tbody>
				{ Object.entries( props ).map( ( [ key, value ] ) => (
					<tr key={ key }>
						<td width="20%">
							{ key }
							{ value.required && (
								<>
									<VisuallyHidden>(Required)</VisuallyHidden>
									<span className={ styles.required } aria-hidden>
										*
									</span>
								</>
							) }
						</td>
						<td width="50%">
							<Markdown>{ value.description }</Markdown>
						</td>
						<td width="15%">{ value.type.name }</td>
						<td width="15%">{ value.defaultValue?.value }</td>
					</tr>
				) ) }
			</tbody>
		</table>
	);
}

export default PropsTable;
