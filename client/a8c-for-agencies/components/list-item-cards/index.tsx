import './style.scss';

export function ListItemCardContent( {
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
} ) {
	return (
		<div className="list-item-card-content">
			<div className="list-item-card-content__header">
				<div className="list-item-card-content__header-title">{ title.toUpperCase() }</div>
			</div>
			{ children }
		</div>
	);
}

export function ListItemCard( { children }: { children: React.ReactNode } ) {
	return <div className="list-item-card">{ children }</div>;
}

export function ListItemCards( { children }: { children: React.ReactNode } ) {
	return <div className="list-item-cards">{ children }</div>;
}
