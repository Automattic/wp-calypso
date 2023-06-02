import './placeholder-lines.scss';

export default function PlaceholderLines( { lines = 4 } ) {
	return (
		<div className="inline-help__results-placeholder">
			{ Array.from( { length: lines }, ( _, n ) => (
				<div key={ n } className="inline-help__results-placeholder-item" />
			) ) }
		</div>
	);
}
