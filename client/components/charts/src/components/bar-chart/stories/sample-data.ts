/**
 * Olympic medals data for top countries (1896-2020)
 * Total medals (Gold + Silver + Bronze) for Summer Olympics
 * Sample data, might not be accurate.
 */
const olympicMedals = [
	{
		group: 'United States',
		label: 'United States',
		data: [
			{ label: '1896', value: 20 }, // Athens
			{ label: '1900', value: 47 }, // Paris
			{ label: '1904', value: 239 }, // St. Louis
			{ label: '1908', value: 47 }, // London
			{ label: '1912', value: 63 }, // Stockholm
			{ label: '1920', value: 95 }, // Antwerp
			{ label: '1924', value: 99 }, // Paris
			{ label: '1928', value: 56 }, // Amsterdam
			{ label: '1932', value: 103 }, // Los Angeles
			{ label: '1936', value: 56 }, // Berlin
			{ label: '1948', value: 84 }, // London
			{ label: '1952', value: 76 }, // Helsinki
			{ label: '1956', value: 74 }, // Melbourne
			{ label: '1960', value: 71 }, // Rome
			{ label: '1964', value: 90 }, // Tokyo
			{ label: '1968', value: 107 }, // Mexico City
			{ label: '1972', value: 94 }, // Munich
			{ label: '1976', value: 94 }, // Montreal
			{ label: '1980', value: 0 }, // Moscow (boycott)
			{ label: '1984', value: 174 }, // Los Angeles
			{ label: '1988', value: 94 }, // Seoul
			{ label: '1992', value: 108 }, // Barcelona
			{ label: '1996', value: 101 }, // Atlanta
			{ label: '2000', value: 93 }, // Sydney
			{ label: '2004', value: 101 }, // Athens
			{ label: '2008', value: 112 }, // Beijing
			{ label: '2012', value: 104 }, // London
			{ label: '2016', value: 121 }, // Rio
			{ label: '2020', value: 113 }, // Tokyo
			{ label: '2024', value: 126 }, // France
		],
	},
	{
		group: 'Great Britain',
		label: 'Great Britain',
		data: [
			{ label: '1896', value: 7 },
			{ label: '1900', value: 30 },
			{ label: '1904', value: 1 },
			{ label: '1908', value: 146 }, // Host
			{ label: '1912', value: 41 },
			{ label: '1920', value: 43 },
			{ label: '1924', value: 34 },
			{ label: '1928', value: 20 },
			{ label: '1932', value: 16 },
			{ label: '1936', value: 14 },
			{ label: '1948', value: 23 },
			{ label: '1952', value: 11 },
			{ label: '1956', value: 24 },
			{ label: '1960', value: 20 },
			{ label: '1964', value: 18 },
			{ label: '1968', value: 13 },
			{ label: '1972', value: 18 },
			{ label: '1976', value: 13 },
			{ label: '1980', value: 21 },
			{ label: '1984', value: 37 },
			{ label: '1988', value: 24 },
			{ label: '1992', value: 20 },
			{ label: '1996', value: 15 },
			{ label: '2000', value: 28 },
			{ label: '2004', value: 30 },
			{ label: '2008', value: 47 },
			{ label: '2012', value: 65 },
			{ label: '2016', value: 67 },
			{ label: '2020', value: 65 },
			{ label: '2024', value: 60 },
		],
	},
	{
		group: 'Japan',
		label: 'Japan',
		data: [
			{ label: '1896', value: 0 }, // Did not participate
			{ label: '1900', value: 0 }, // Did not participate
			{ label: '1904', value: 0 }, // Did not participate
			{ label: '1908', value: 0 }, // Did not participate
			{ label: '1912', value: 2 },
			{ label: '1920', value: 0 }, // Did not participate
			{ label: '1924', value: 4 },
			{ label: '1928', value: 5 },
			{ label: '1932', value: 18 },
			{ label: '1936', value: 20 },
			{ label: '1948', value: 0 }, // Excluded
			{ label: '1952', value: 9 },
			{ label: '1956', value: 19 },
			{ label: '1960', value: 18 },
			{ label: '1964', value: 29 }, // Host
			{ label: '1968', value: 25 },
			{ label: '1972', value: 29 },
			{ label: '1976', value: 25 },
			{ label: '1980', value: 0 }, // Boycott
			{ label: '1984', value: 32 },
			{ label: '1988', value: 14 },
			{ label: '1992', value: 22 },
			{ label: '1996', value: 14 },
			{ label: '2000', value: 18 },
			{ label: '2004', value: 37 },
			{ label: '2008', value: 25 },
			{ label: '2012', value: 38 },
			{ label: '2016', value: 41 },
			{ label: '2020', value: 58 }, // Host
			{ label: '2024', value: 45 },
		],
	},
	{
		group: 'China',
		label: 'China',
		data: [
			{ label: '1896', value: 0 }, // No participation before 1984
			{ label: '1900', value: 0 }, // No participation before 1984
			{ label: '1904', value: 0 }, // No participation before 1984
			{ label: '1908', value: 0 }, // No participation before 1984
			{ label: '1912', value: 0 }, // No participation before 1984
			{ label: '1920', value: 0 }, // No participation before 1984
			{ label: '1924', value: 0 }, // No participation before 1984
			{ label: '1928', value: 0 }, // No participation before 1984
			{ label: '1932', value: 0 }, // No participation before 1984
			{ label: '1936', value: 0 }, // No participation before 1984
			{ label: '1948', value: 0 }, // No participation before 1984
			{ label: '1952', value: 0 }, // First participation in 1984
			{ label: '1956', value: 0 }, // Did not participate
			{ label: '1960', value: 0 }, // Did not participate
			{ label: '1964', value: 0 }, // Did not participate
			{ label: '1968', value: 0 }, // Did not participate
			{ label: '1972', value: 0 }, // Did not participate
			{ label: '1976', value: 0 }, // Did not participate
			{ label: '1980', value: 0 }, // Did not participate
			{ label: '1984', value: 32 },
			{ label: '1988', value: 28 },
			{ label: '1992', value: 54 },
			{ label: '1996', value: 50 },
			{ label: '2000', value: 59 },
			{ label: '2004', value: 63 },
			{ label: '2008', value: 100 }, // Host
			{ label: '2012', value: 91 },
			{ label: '2016', value: 70 },
			{ label: '2020', value: 88 },
			{ label: '2024', value: 91 },
		],
	},
	{
		group: 'France',
		label: 'France',
		data: [
			{ label: '1896', value: 11 },
			{ label: '1900', value: 101 }, // Host
			{ label: '1904', value: 0 },
			{ label: '1908', value: 19 },
			{ label: '1912', value: 14 },
			{ label: '1920', value: 41 },
			{ label: '1924', value: 38 }, // Host
			{ label: '1928', value: 21 },
			{ label: '1932', value: 19 },
			{ label: '1936', value: 19 },
			{ label: '1948', value: 29 },
			{ label: '1952', value: 18 },
			{ label: '1956', value: 14 },
			{ label: '1960', value: 5 },
			{ label: '1964', value: 15 },
			{ label: '1968', value: 15 },
			{ label: '1972', value: 13 },
			{ label: '1976', value: 9 },
			{ label: '1980', value: 14 },
			{ label: '1984', value: 28 },
			{ label: '1988', value: 16 },
			{ label: '1992', value: 29 },
			{ label: '1996', value: 37 },
			{ label: '2000', value: 38 },
			{ label: '2004', value: 33 },
			{ label: '2008', value: 43 },
			{ label: '2012', value: 35 },
			{ label: '2016', value: 42 },
			{ label: '2020', value: 33 },
			{ label: '2024', value: 55 }, // Host
		],
	},
	{
		group: 'Germany',
		label: 'Germany',
		data: [
			{ label: '1896', value: 13 },
			{ label: '1900', value: 8 },
			{ label: '1904', value: 4 },
			{ label: '1908', value: 22 },
			{ label: '1912', value: 25 },
			{ label: '1928', value: 31 },
			{ label: '1932', value: 20 },
			{ label: '1936', value: 89 }, // Host
			{ label: '1952', value: 24 },
			{ label: '1956', value: 64 },
			{ label: '1960', value: 87 }, // United Team
			{ label: '1964', value: 96 }, // United Team
			{ label: '1968', value: 91 }, // East and West combined
			{ label: '1972', value: 133 }, // Host (West Germany)
			{ label: '1976', value: 125 }, // East and West combined
			{ label: '1980', value: 126 }, // East Germany only
			{ label: '1984', value: 59 }, // West Germany only
			{ label: '1988', value: 142 }, // East and West combined
			{ label: '1992', value: 82 }, // Unified team
			{ label: '1996', value: 65 },
			{ label: '2000', value: 56 },
			{ label: '2004', value: 48 },
			{ label: '2008', value: 41 },
			{ label: '2012', value: 44 },
			{ label: '2016', value: 42 },
			{ label: '2020', value: 37 },
			{ label: '2024', value: 40 },
		],
	},
	{
		group: 'Australia',
		label: 'Australia',
		data: [
			{ label: '1896', value: 0 },
			{ label: '1900', value: 2 },
			{ label: '1904', value: 0 },
			{ label: '1908', value: 15 },
			{ label: '1912', value: 7 },
			{ label: '1920', value: 3 },
			{ label: '1924', value: 6 },
			{ label: '1928', value: 4 },
			{ label: '1932', value: 5 },
			{ label: '1936', value: 3 },
			{ label: '1948', value: 13 },
			{ label: '1952', value: 11 },
			{ label: '1956', value: 35 }, // Host
			{ label: '1960', value: 22 },
			{ label: '1964', value: 18 },
			{ label: '1968', value: 17 },
			{ label: '1972', value: 8 },
			{ label: '1976', value: 5 },
			{ label: '1980', value: 9 },
			{ label: '1984', value: 24 },
			{ label: '1988', value: 14 },
			{ label: '1992', value: 27 },
			{ label: '1996', value: 41 },
			{ label: '2000', value: 58 }, // Host
			{ label: '2004', value: 49 },
			{ label: '2008', value: 46 },
			{ label: '2012', value: 35 },
			{ label: '2016', value: 29 },
			{ label: '2020', value: 46 },
			{ label: '2024', value: 42 },
		],
	},
	{
		group: 'Poland',
		label: 'Poland',
		data: [
			{ label: '1896', value: 0 },
			{ label: '1900', value: 0 },
			{ label: '1904', value: 0 },
			{ label: '1908', value: 0 },
			{ label: '1912', value: 0 }, // Part of Russian Empire
			{ label: '1920', value: 0 },
			{ label: '1924', value: 0 },
			{ label: '1928', value: 5 },
			{ label: '1932', value: 7 },
			{ label: '1936', value: 6 },
			{ label: '1948', value: 0 },
			{ label: '1952', value: 4 },
			{ label: '1956', value: 9 },
			{ label: '1960', value: 21 },
			{ label: '1964', value: 23 },
			{ label: '1968', value: 18 },
			{ label: '1972', value: 21 },
			{ label: '1976', value: 26 },
			{ label: '1980', value: 32 },
			{ label: '1984', value: 0 }, // Boycott
			{ label: '1988', value: 16 },
			{ label: '1992', value: 19 },
			{ label: '1996', value: 17 },
			{ label: '2000', value: 14 },
			{ label: '2004', value: 10 },
			{ label: '2008', value: 10 },
			{ label: '2012', value: 10 },
			{ label: '2016', value: 11 },
			{ label: '2020', value: 14 },
			{ label: '2024', value: 15 },
		],
	},
	{
		group: 'Jamaica',
		label: 'Jamaica',
		data: [
			{ label: '1896', value: 0 },
			{ label: '1900', value: 0 },
			{ label: '1904', value: 0 },
			{ label: '1908', value: 0 },
			{ label: '1912', value: 0 },
			{ label: '1920', value: 0 },
			{ label: '1924', value: 0 },
			{ label: '1928', value: 0 },
			{ label: '1932', value: 0 },
			{ label: '1936', value: 0 },
			{ label: '1948', value: 3 }, // First participation
			{ label: '1952', value: 2 },
			{ label: '1956', value: 0 },
			{ label: '1960', value: 0 },
			{ label: '1964', value: 2 },
			{ label: '1968', value: 1 },
			{ label: '1972', value: 1 },
			{ label: '1976', value: 2 },
			{ label: '1980', value: 3 },
			{ label: '1984', value: 3 },
			{ label: '1988', value: 2 },
			{ label: '1992', value: 4 },
			{ label: '1996', value: 6 },
			{ label: '2000', value: 9 },
			{ label: '2004', value: 5 },
			{ label: '2008', value: 11 },
			{ label: '2012', value: 12 },
			{ label: '2016', value: 11 },
			{ label: '2020', value: 9 },
			{ label: '2024', value: 10 },
		],
	},
];

export default olympicMedals;
