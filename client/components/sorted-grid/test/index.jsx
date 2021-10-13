/**
 * @jest-environment jsdom
 */

import { expect } from 'chai';
import { shallow } from 'enzyme';
import SortedGrid from '../';
import Label from '../label';

describe( 'SortedGrid', () => {
	const nullfunc = () => {};
	const getItemGroup = () => 'item-group';

	test( 'should not render labels if the group label is an empty string', () => {
		const wrapper = shallow(
			<SortedGrid
				getItemGroup={ getItemGroup }
				getGroupLabel={ nullfunc }
				context={ false }
				items={ [] }
				itemsPerRow={ 6 }
				lastPage={ true }
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
		expect( wrapper.find( Label ) ).to.have.length( 0 );
	} );
} );
