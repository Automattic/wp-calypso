/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import SortedGrid from '../';

describe( 'SortedGrid', () => {
	const nullfunc = () => {};
	const getItemGroup = () => 'item-group';

	test( 'should not render labels if the group label is an empty string', () => {
		const { container } = render(
			<SortedGrid
				getItemGroup={ getItemGroup }
				getGroupLabel={ nullfunc }
				context={ false }
				items={ [] }
				itemsPerRow={ 6 }
				lastPage
				fetchingNextPage={ false }
				guessedItemHeight={ 64 }
				fetchNextPage={ nullfunc }
				getItemRef={ nullfunc }
				renderItem={ nullfunc }
				renderLoadingPlaceholders={ nullfunc }
				renderTrailingItems={ nullfunc }
				className="test__sortedgrid"
			/>
		);
		expect( container.getElementsByClassName( 'sorted-grid__label' ) ).toHaveLength( 0 );
	} );
} );
