/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { range } from 'lodash';
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import InfiniteList from '../';

function getItemRef( item ) {
	return 'i' + item;
}

const defaultProps = {
	items: [],
	fetchingNextPage: false,
	lastPage: false,
	fetchNextPage: () => null,
	getItemRef: () => '',
	renderItem: () => null,
	renderLoadingPlaceholders: () => null,
	context: this,
	guessedItemHeight: 0,
};

describe( 'InfiniteList', () => {
	describe( 'Hide Levels', () => {
		describe( 'Context Higher than 5 items', () => {
			const list = shallow(
				<InfiniteList { ...defaultProps } guessedItemHeight={ 100 } itemsPerRow={ 1 } />
			).instance();
			list.updateContextHeight( 1000 );

			test( 'top hard hide levels is 1 vh above context', () => {
				assert.equal( list.topHideLevelHard, -1000 );
			} );
			test( 'top soft hide level is 2 vh above context', () => {
				assert.equal( list.topHideLevelSoft, -2000 );
			} );
			test( 'bottom hard hide level is 1 vh below context', () => {
				assert.equal( list.bottomHideLevelHard, 2000 );
			} );
			test( 'bottom soft hide level is 2 vh below context', () => {
				assert.equal( list.bottomHideLevelSoft, 3000 );
			} );
			test( 'bottom 3rd hide level is 3 vh below context', () => {
				assert.equal( list.bottomHideLevelUltraSoft, 4000 );
			} );
		} );

		describe( 'Context Shorter than 5 items', () => {
			const list = shallow(
				<InfiniteList { ...defaultProps } guessedItemHeight={ 100 } itemsPerRow={ 1 } />
			).instance();
			list.updateContextHeight( 200 );

			test( 'top hard hide levels is 5 items above context', () => {
				assert.equal( list.topHideLevelHard, -500 );
			} );
			test( 'top soft hide level is 10 items above context', () => {
				assert.equal( list.topHideLevelSoft, -1000 );
			} );
			test( 'bottom hard hide level is 5 items below context', () => {
				assert.equal( list.bottomHideLevelHard, 700 );
			} );
			test( 'bottom soft hide level is 10 items below context', () => {
				assert.equal( list.bottomHideLevelSoft, 1200 );
			} );
			test( 'bottom 3rd hide level is 15 items below context', () => {
				assert.equal( list.bottomHideLevelUltraSoft, 1700 );
			} );
		} );
	} );

	describe( 'Container and placeholder positioning', () => {
		const preparedBounds = {
				topPlaceholder: {
					top: -2000,
					height: 1000,
				},
				bottomPlaceholder: {
					bottom: 4000,
					height: 2000,
				},
			},
			list = shallow( <InfiniteList { ...defaultProps } /> ).instance();
		list.boundsForRef = ref => {
			return preparedBounds[ ref ];
		};

		list.updatePlaceholderDimensions();

		test( 'Placeholders height determined using their bounds ', () => {
			assert.equal( list.topPlaceholderHeight, 1000 );
			assert.equal( list.bottomPlaceholderHeight, 2000 );
		} );

		test( 'Container top determined using top placeholder bounds', () => {
			assert.equal( list.containerTop, -2000 );
		} );

		test( 'Container bottom determined using bottom placeholder bounds', () => {
			assert.equal( list.containerBottom, 4000 );
		} );
	} );

	describe( 'Initial last rendered index', () => {
		test( 'renders only up to bottom soft hide level', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 200 }
					itemsPerRow={ 1 }
					items={ range( 100 ) }
				/>
			).instance();
			list.updateContextHeight( 1000 );
			assert.equal( list.initialLastRenderedIndex(), 14 ); // 3000 / 200 - 1
		} );

		test( 'renders everything if it should fit', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 200 }
					itemsPerRow={ 1 }
					items={ range( 10 ) }
				/>
			).instance();
			list.updateContextHeight( 1000 );
			assert.equal( list.initialLastRenderedIndex(), 9 );
		} );
	} );

	describe( 'Items Above', () => {
		test( 'Starts hiding when placeholder bottom edge is above soft level', () => {
			const list = shallow( <InfiniteList { ...defaultProps } /> ).instance();
			list.containerTop = -3000;
			list.topPlaceholderHeight = 500;
			list.topHideLevelSoft = -2000;

			assert.ok( list.shouldHideItemsAbove() );

			list.topPlaceholderHeight = 1500;
			assert.notOk( list.shouldHideItemsAbove() );
		} );

		describe( 'Hiding batch of items', () => {
			const preparedBounds = {
					i0: {
						bottom: -1850,
					},
					i1: {
						bottom: -1500,
					},
					// i2: { bottom: -1200 }, Let it use guessedItemHeight for this one
					i3: {
						bottom: -900,
					},
				},
				list = shallow(
					<InfiniteList
						{ ...defaultProps }
						guessedItemHeight={ 300 }
						itemsPerRow={ 1 }
						items={ range( 4 ) }
						getItemRef={ getItemRef }
					/>
				).instance();
			list.boundsForRef = ref => {
				return preparedBounds[ ref ];
			};
			list.reset( {
				firstRenderedIndex: 0,
			} );
			list.containerTop = -2100;
			list.topHideLevelHard = -1000;
			list.topPlaceholderHeight = 0;

			list.hideItemsAbove();

			test( 'updated state', () => {
				assert( list.stateUpdated );
			} );

			test( 'created placeholder for 3 items', () => {
				assert.equal( 900, list.topPlaceholderHeight );
			} );

			test( 'hid 3 items', () => {
				assert.equal( 3, list.firstRenderedIndex );
			} );

			test( 'stored hidden items height', () => {
				assert.deepEqual(
					{
						i0: 250,
						i1: 350,
						i2: 300,
					},
					list.itemHeights
				);
			} );
		} );

		describe( 'Completely above context', () => {
			const preparedBounds = {
					i0: {
						bottom: -1850,
					},
					i1: {
						bottom: -1500,
					},
				},
				list = shallow(
					<InfiniteList
						{ ...defaultProps }
						guessedItemHeight={ 300 }
						itemsPerRow={ 1 }
						items={ range( 2 ) }
						getItemRef={ getItemRef }
					/>
				).instance();
			list.boundsForRef = ref => {
				return preparedBounds[ ref ];
			};

			list.reset( {
				firstRenderedIndex: 0,
			} );

			list.containerTop = -2100;
			list.topHideLevelHard = -1000;
			list.topPlaceholderHeight = 0;

			list.hideItemsAbove();

			test( 'created placeholder for 2 items', () => {
				assert.equal( 600, list.topPlaceholderHeight );
			} );

			test( 'hid 2 items', () => {
				assert.equal( 2, list.firstRenderedIndex );
			} );
		} );

		test( 'Starts showing when placeholder bottom edge is below hard level', () => {
			const list = shallow( <InfiniteList { ...defaultProps } /> ).instance();
			list.containerTop = -3000;
			list.topPlaceholderHeight = 2500;
			list.topHideLevelHard = -1000;

			assert.ok( list.shouldShowItemsAbove() );

			list.topPlaceholderHeight = 1500;
			assert.notOk( list.shouldShowItemsAbove() );
		} );

		describe( 'Showing batch of items', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 6 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				firstRenderedIndex: 5,
			} );
			list.containerTop = -2100;
			list.topHideLevelSoft = -2000;
			list.topPlaceholderHeight = 1500;
			list.firstRenderedIndex = 5;
			list.itemHeights = {
				i0: 250,
				i1: 350,
				i3: 300,
				i4: 300,
			}; // i2 left to default

			list.showItemsAbove();

			test( 'updated state', () => {
				assert( list.stateUpdated );
			} );

			test( 'reduced placeholder height', () => {
				assert.equal( 250, list.topPlaceholderHeight );
			} );

			test( 'shown 4 items', () => {
				assert.equal( 1, list.firstRenderedIndex );
			} );

			test( 'removed shown items height', () => {
				assert.deepEqual(
					{
						i0: 250,
					},
					list.itemHeights
				);
			} );
		} );

		describe( 'Show items when their real height is higher than stored', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 3 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				firstRenderedIndex: 2,
			} );
			list.containerTop = 0;
			list.topHideLevelSoft = -2000;
			// extrame case - no top placeholder, but still items to be shown
			list.topPlaceholderHeight = 0;
			// item heights left to default

			list.showItemsAbove();

			test( 'placeholder height is never negative', () => {
				assert.equal( 0, list.topPlaceholderHeight );
			} );

			test( 'shown all items', () => {
				assert.equal( 0, list.firstRenderedIndex );
			} );
		} );

		test( 'removes placeholder if everything is shown', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 3 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				firstRenderedIndex: 2,
			} );
			list.containerTop = 0;
			list.topHideLevelSoft = -2000;
			list.topPlaceholderHeight = 700; // more than 2 * 300
			// item heights left to default

			list.showItemsAbove();

			assert.equal( 0, list.topPlaceholderHeight );
		} );
	} );

	describe( 'Items Below', () => {
		test( 'Starts hiding when placholder top edge is below 3rd hide limit', () => {
			const list = shallow( <InfiniteList { ...defaultProps } /> ).instance();
			list.containerBottom = 5000;
			list.bottomPlaceholderHeight = 500;
			list.bottomHideLevelUltraSoft = 4000;

			assert.ok( list.shouldHideItemsBelow() );

			list.bottomPlaceholderHeight = 1500;
			assert.notOk( list.shouldHideItemsBelow() );
		} );

		describe( 'Hiding batch of items', () => {
			const preparedBounds = {
					i5: {
						top: 1900,
					},
					i6: {
						top: 2200,
					},
					i7: {
						top: 2500,
					},
					// i8: { top: 3400 }, Let it use guessedItemHeight for this one
					i9: {
						top: 3700,
					},
				},
				list = shallow(
					<InfiniteList
						{ ...defaultProps }
						guessedItemHeight={ 300 }
						itemsPerRow={ 1 }
						items={ range( 10 ) }
						getItemRef={ getItemRef }
					/>
				).instance();
			list.boundsForRef = ref => {
				return preparedBounds[ ref ];
			};
			list.reset( {
				lastRenderedIndex: 9,
			} );

			list.containerBottom = 5000;
			list.bottomHideLevelHard = 2000;
			list.bottomPlaceholderHeight = 800;

			list.hideItemsBelow();

			test( 'updated state', () => {
				assert.ok( list.stateUpdated );
			} );

			test( 'created placeholder for 3 items', () => {
				assert.equal( 2800, list.bottomPlaceholderHeight );
			} );

			test( 'hid 4 items', () => {
				assert.equal( 5, list.lastRenderedIndex );
			} );

			test( 'stored hidden items height', () => {
				assert.deepEqual(
					{
						i6: 300,
						i7: 900,
						i8: 300,
						i9: 500,
					},
					list.itemHeights
				);
			} );
		} );

		describe( 'Completely below context', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 2 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.boundsForRef = () => {
				return null;
			}; // let it use guessed height
			list.reset( {
				lastRenderedIndex: 1,
			} );

			list.containerBottom = 5000;
			list.bottomHideLevelHard = 2000;
			list.bottomPlaceholderHeight = 800;

			list.hideItemsBelow();

			test( 'created placeholder for 2 items', () => {
				assert.equal( 1400, list.bottomPlaceholderHeight );
			} );

			test( 'hid all items', () => {
				assert.equal( -1, list.lastRenderedIndex );
			} );
		} );

		test( 'Starts showing when placeholder top edge is above first hide limit', () => {
			const list = shallow( <InfiniteList { ...defaultProps } /> ).instance();
			list.containerBottom = 5000;
			list.bottomPlaceholderHeight = 3500;
			list.bottomHideLevelHard = 2000;

			assert.ok( list.shouldShowItemsBelow() );

			list.bottomPlaceholderHeight = 2500;
			assert.notOk( list.shouldShowItemsBelow() );
		} );

		describe( 'Showing batch of items', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 8 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				lastRenderedIndex: 4,
			} );

			list.containerBottom = 5000;
			list.bottomHideLevelHard = 2000;
			list.bottomHideLevelSoft = 3000;
			list.bottomPlaceholderHeight = 3100;
			list.itemHeights = {
				i5: 300,
				i6: 300,
				i7: 900,
			};
			// corresponding itemTops: 1900, 2200, 2500, 3400

			list.showItemsBelow();

			test( 'updated state', () => {
				assert( list.stateUpdated );
			} );

			test( 'reduced placeholder height', () => {
				assert.equal( 2500, list.bottomPlaceholderHeight );
			} );

			test( 'shown 2 items', () => {
				assert.equal( 6, list.lastRenderedIndex );
			} );

			test( 'removed shown items height', () => {
				assert.deepEqual(
					{
						i7: 900,
					},
					list.itemHeights
				);
			} );
		} );

		describe( 'Show item longer than context', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 8 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				lastRenderedIndex: 4,
			} );

			list.containerBottom = 5000;
			list.bottomHideLevelHard = 2000;
			list.bottomHideLevelSoft = 3000;
			list.bottomPlaceholderHeight = 3100;
			list.itemHeights = {
				i5: 1200,
				i6: 300,
			};
			// corresponding itemTops: 3100, 3400

			list.showItemsBelow();

			test( 'reduced placeholder height', () => {
				assert.equal( 1900, list.bottomPlaceholderHeight );
			} );

			test( 'shown 2 items', () => {
				assert.equal( 5, list.lastRenderedIndex );
			} );
		} );

		describe( 'Show new items', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 8 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				lastRenderedIndex: 4,
			} );
			list.containerBottom = 900;
			list.bottomHideLevelHard = 2000;
			list.bottomHideLevelSoft = 3000;
			list.bottomPlaceholderHeight = 200;
			// stored item heighs left to default

			list.showItemsBelow();

			test( 'placeholder height is never negative', () => {
				assert.equal( 0, list.bottomPlaceholderHeight );
			} );

			test( 'container bottom is increased', () => {
				assert.equal( 1600, list.containerBottom );
			} );

			test( 'shown 3 items', () => {
				assert.equal( 7, list.lastRenderedIndex );
			} );
		} );

		test( 'Placeholder height is always zero if everything shown', () => {
			const list = shallow(
				<InfiniteList
					{ ...defaultProps }
					guessedItemHeight={ 300 }
					itemsPerRow={ 1 }
					items={ range( 8 ) }
					getItemRef={ getItemRef }
				/>
			).instance();
			list.reset( {
				lastRenderedIndex: 4,
			} );

			list.containerBottom = 5000;
			list.bottomHideLevelHard = 2000;
			list.bottomHideLevelSoft = 3000;
			list.bottomPlaceholderHeight = 4200;
			// stored item heighs left to default

			list.showItemsBelow();

			assert.equal( 0, list.bottomPlaceholderHeight );
			assert.equal( 7, list.lastRenderedIndex );
		} );
	} );

	describe( 'Next page', () => {
		const baseProps = {
			...defaultProps,
			fetchingNextPage: false,
			lastPage: false,
			items: range( 8 ),
			getItemRef,
		};

		const createList = props => {
			const list = shallow( <InfiniteList { ...baseProps } { ...props } /> ).instance();
			list.updateContextHeight( 1000 );
			list.bottomPlaceholderHeight = 0;
			list.containerBottom = 1900;
			list.bottomHideLevelHard = 2000;
			return list;
		};

		test( 'loaded when container bottom above hard limit', () => {
			const list = createList();
			assert.ok( list.shouldLoadNextPage() );
		} );

		test( 'not loaded when loading previous', () => {
			const list = createList( { fetchingNextPage: true } );
			assert.notOk( list.shouldLoadNextPage() );
		} );

		test( 'not loaded on last page', () => {
			const list = createList( { lastPage: true } );
			assert.notOk( list.shouldLoadNextPage() );
		} );

		test( 'not loaded if some items hidden', () => {
			const list = createList( { bottomPlaceholderHeight: 100 } );
			list.bottomPlaceholderHeight = 100;
			assert.notOk( list.shouldLoadNextPage() );
		} );
	} );
} );
