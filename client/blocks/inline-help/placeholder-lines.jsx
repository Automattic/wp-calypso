export default ( { lines = 4 } ) => (
	<div className="inline-help__results-placeholder">
		{ Array.from( { length: lines }, ( _, n ) => (
			<div key={ n } className="inline-help__results-placeholder-item" />
		) ) }
	</div>
);
