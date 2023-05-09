import './placeholder-lines.scss';

export default function PlaceholderLines( { lines = 4 } ) {
	return (
		<div className="placeholder-lines__help-center">
			{ Array.from( { length: lines }, ( _, n ) => (
				<div key={ n } className="placeholder-lines__help-center-item" />
			) ) }
		</div>
	);
}
