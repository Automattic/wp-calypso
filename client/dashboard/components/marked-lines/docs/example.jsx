import MarkedLines from '../index';

MarkedLines.displayName = 'MarkedLines';

const MarkedLinesExample = ( { exampleCode } ) => exampleCode;

MarkedLinesExample.displayName = 'MarkedLines';

MarkedLinesExample.defaultProps = {
	exampleCode: `
		<MarkedLines
			context={ {
				1: 'add :: Num a => a -> a -> a',
				11: 'add = (+)',
				15: 'solve a b = solution',
				16: '	where',
				17: '		solution = sum parts',
				18: '		{- 💩 indices are in UCS-2 code units -}',
				19: '		sum = foldl add 0',
				20: '		parts = foo a b',
				580: '{- lines need not be contiguous and they can also be really long - longer than the screen can display, but that is fine-}',
				marks: {
					11: [ [ 6, 9 ] ],
					18: [ [ 23, 28 ] ],
					19: [ [ 2, 5 ], [ 14, 17 ] ],
				},
			} }
		/>
	`,
};

export default MarkedLinesExample;
