import './style.scss';

interface Props {
	log: Record< string, unknown >;
}

export default function SiteLogsExpandedContent( { log }: Props ) {
	return (
		<div className="site-logs-table__expanded-content">
			{ Object.keys( log ).map( ( key ) => (
				<tr key={ `expanded-row-${ key }` }>
					<td>{ key }</td>
					<td>
						<div className="site-logs-table__expanded-content-info">{ log[ key ] }</div>
					</td>
				</tr>
			) ) }
		</div>
	);
}
