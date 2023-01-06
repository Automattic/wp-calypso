const FORMATTER = new Intl.NumberFormat();
function formatNumber( number: number | null ) {
	return Number.isFinite( number ) ? FORMATTER.format( number as number ) : '-';
}

const formatedNumber = ( number: number | null ) => formatNumber( number );

export default formatedNumber;
