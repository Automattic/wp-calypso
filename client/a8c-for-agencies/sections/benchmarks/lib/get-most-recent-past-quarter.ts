export type Quarter = { quarter: 1 | 2 | 3 | 4; year: number };

export default function getMostRecentPastQuarter( now: Date = new Date() ): Quarter {
	const month = now.getUTCMonth(); // 0–11
	const year = now.getUTCFullYear();
	const currentQuarter = ( Math.floor( month / 3 ) + 1 ) as 1 | 2 | 3 | 4;

	if ( currentQuarter === 1 ) {
		return { quarter: 4, year: year - 1 };
	}

	return { quarter: ( currentQuarter - 1 ) as 1 | 2 | 3, year };
}
