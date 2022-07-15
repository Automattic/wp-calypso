import './style.scss';

type Props = {
	title: string | React.ReactElement;
	subtitle: string | React.ReactElement;
	leading?: React.ReactNode | React.ReactElement;
	trailing?: React.ReactNode | React.ReactElement;
};

export const ListTile = ( { title, subtitle, leading, trailing }: Props ) => {
	if ( typeof title === 'string' ) {
		title = <h2 className="list-tile__title"> { title } </h2>;
	}
	if ( typeof subtitle === 'string' ) {
		subtitle = <span className="list-tile__subtitle"> { subtitle } </span>;
	}

	return (
		<div className="list-tile">
			{ leading && <div className="list-tile__leading">{ leading }</div> }
			<div style={ { width: '100%' } }>
				{ title }
				{ subtitle }
			</div>
			{ trailing && <div>{ trailing }</div> }
		</div>
	);
};
