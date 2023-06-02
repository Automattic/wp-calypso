import { range } from 'lodash';
import ScrollHelper from '../scroll-helper';

function getItemRef( item ) {
	return 'i' + item;
}

describe( 'scroll-helper', () => {
	describe( 'Hide Levels', () => {
		describe( 'Context Higher than 5 items', () => {
			const helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 100,
				itemsPerRow: 1,
			};
			helper.updateContextHeight( 1000 );

			test( 'top hard hide levels is 1 vh above context', () => {
				expect( helper.topHideLevelHard ).toEqual( -1000 );
			} );
			test( 'top soft hide level is 2 vh above context', () => {
				expect( helper.topHideLevelSoft ).toEqual( -2000 );
			} );
			test( 'bottom hard hide level is 1 vh below context', () => {
				expect( helper.bottomHideLevelHard ).toEqual( 2000 );
			} );
			test( 'bottom soft hide level is 2 vh below context', () => {
				expect( helper.bottomHideLevelSoft ).toEqual( 3000 );
			} );
			test( 'bottom 3rd hide level is 3 vh below context', () => {
				expect( helper.bottomHideLevelUltraSoft ).toEqual( 4000 );
			} );
		} );

		describe( 'Context Shorter than 5 items', () => {
			const helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 100,
				itemsPerRow: 1,
			};
			helper.updateContextHeight( 200 );

			test( 'top hard hide levels is 5 items above context', () => {
				expect( helper.topHideLevelHard ).toEqual( -500 );
			} );
			test( 'top soft hide level is 10 items above context', () => {
				expect( helper.topHideLevelSoft ).toEqual( -1000 );
			} );
			test( 'bottom hard hide level is 5 items below context', () => {
				expect( helper.bottomHideLevelHard ).toEqual( 700 );
			} );
			test( 'bottom soft hide level is 10 items below context', () => {
				expect( helper.bottomHideLevelSoft ).toEqual( 1200 );
			} );
			test( 'bottom 3rd hide level is 15 items below context', () => {
				expect( helper.bottomHideLevelUltraSoft ).toEqual( 1700 );
			} );
		} );
	} );

	describe( 'Container and placeholder positioning', () => {
		const topPlaceholderBounds = () => ( { top: -2000, height: 1000 } );
		const bottomPlaceholderBounds = () => ( { bottom: 4000, height: 2000 } );

		const helper = new ScrollHelper( () => null, topPlaceholderBounds, bottomPlaceholderBounds );

		helper.updatePlaceholderDimensions();

		test( 'Placeholders height determined using their bounds', () => {
			expect( helper.topPlaceholderHeight ).toEqual( 1000 );
			expect( helper.bottomPlaceholderHeight ).toEqual( 2000 );
		} );

		test( 'Container top determined using top placeholder bounds', () => {
			expect( helper.containerTop ).toEqual( -2000 );
		} );

		test( 'Container bottom determined using bottom placeholder bounds', () => {
			expect( helper.containerBottom ).toEqual( 4000 );
		} );
	} );

	describe( 'Initial last rendered index', () => {
		let helper;
		beforeEach( () => {
			helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 200,
				itemsPerRow: 1,
			};
			helper.updateContextHeight( 1000 );
		} );

		test( 'renders only up to bottom soft hide level', () => {
			helper.props.items = range( 100 );
			expect( helper.initialLastRenderedIndex() ).toEqual( 14 ); // 3000 / 200 - 1
		} );

		test( 'renders everything if it should fit', () => {
			helper.props.items = range( 10 );
			expect( helper.initialLastRenderedIndex() ).toEqual( 9 );
		} );
	} );

	describe( 'Items Above', () => {
		test( 'Starts hiding when placeholder bottom edge is above soft level', () => {
			const helper = new ScrollHelper();
			helper.containerTop = -3000;
			helper.topPlaceholderHeight = 500;
			helper.topHideLevelSoft = -2000;

			expect( helper.shouldHideItemsAbove() ).toBeTruthy();

			helper.topPlaceholderHeight = 1500;
			expect( helper.shouldHideItemsAbove() ).toBeFalsy();
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
			};
			const helper = new ScrollHelper( function ( ref ) {
				return preparedBounds[ ref ];
			} );
			helper.props = {
				guessedItemHeight: 300,
				items: range( 4 ),
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				firstRenderedIndex: 0,
			} );
			helper.containerTop = -2100;
			helper.topHideLevelHard = -1000;
			helper.topPlaceholderHeight = 0;

			helper.hideItemsAbove();

			test( 'updated state', () => {
				expect( helper.stateUpdated ).toBeTruthy();
			} );

			test( 'created placeholder for 3 items', () => {
				expect( 900 ).toEqual( helper.topPlaceholderHeight );
			} );

			test( 'hid 3 items', () => {
				expect( 3 ).toEqual( helper.firstRenderedIndex );
			} );

			test( 'stored hidden items height', () => {
				expect( {
					i0: 250,
					i1: 350,
					i2: 300,
				} ).toEqual( helper.itemHeights );
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
			};
			const helper = new ScrollHelper( function ( ref ) {
				return preparedBounds[ ref ];
			} );

			helper.props = {
				guessedItemHeight: 300,
				items: range( 2 ),
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				firstRenderedIndex: 0,
			} );

			helper.containerTop = -2100;
			helper.topHideLevelHard = -1000;
			helper.topPlaceholderHeight = 0;

			helper.hideItemsAbove();

			test( 'created placeholder for 2 items', () => {
				expect( 600 ).toEqual( helper.topPlaceholderHeight );
			} );

			test( 'hid 2 items', () => {
				expect( 2 ).toEqual( helper.firstRenderedIndex );
			} );
		} );

		test( 'Starts showing when placeholder bottom edge is below hard level', () => {
			const helper = new ScrollHelper();
			helper.containerTop = -3000;
			helper.topPlaceholderHeight = 2500;
			helper.topHideLevelHard = -1000;

			expect( helper.shouldShowItemsAbove() ).toBeTruthy();

			helper.topPlaceholderHeight = 1500;
			expect( helper.shouldShowItemsAbove() ).toBeFalsy();
		} );

		describe( 'Showing batch of items', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 6 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				firstRenderedIndex: 5,
			} );
			helper.containerTop = -2100;
			helper.topHideLevelSoft = -2000;
			helper.topPlaceholderHeight = 1500;
			helper.firstRenderedIndex = 5;
			helper.itemHeights = {
				i0: 250,
				i1: 350,
				i3: 300,
				i4: 300,
			}; // i2 left to default

			helper.showItemsAbove();

			test( 'updated state', () => {
				expect( helper.stateUpdated ).toBeTruthy();
			} );

			test( 'reduced placeholder height', () => {
				expect( 250 ).toEqual( helper.topPlaceholderHeight );
			} );

			test( 'shown 4 items', () => {
				expect( 1 ).toEqual( helper.firstRenderedIndex );
			} );

			test( 'removed shown items height', () => {
				expect( {
					i0: 250,
				} ).toEqual( helper.itemHeights );
			} );
		} );

		describe( 'Show items when their real height is higher than stored', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 3 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				firstRenderedIndex: 2,
			} );
			helper.containerTop = 0;
			helper.topHideLevelSoft = -2000;
			// extrame case - no top placeholder, but still items to be shown
			helper.topPlaceholderHeight = 0;
			// item heights left to default

			helper.showItemsAbove();

			test( 'placeholder height is never negative', () => {
				expect( 0 ).toEqual( helper.topPlaceholderHeight );
			} );

			test( 'shown all items', () => {
				expect( 0 ).toEqual( helper.firstRenderedIndex );
			} );
		} );

		test( 'removes placeholder if everything is shown', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 3 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				firstRenderedIndex: 2,
			} );
			helper.containerTop = 0;
			helper.topHideLevelSoft = -2000;
			helper.topPlaceholderHeight = 700; // more than 2 * 300
			// item heights left to default

			helper.showItemsAbove();

			expect( 0 ).toEqual( helper.topPlaceholderHeight );
		} );
	} );

	describe( 'Items Below', () => {
		test( 'Starts hiding when placholder top edge is below 3rd hide limit', () => {
			const helper = new ScrollHelper();
			helper.containerBottom = 5000;
			helper.bottomPlaceholderHeight = 500;
			helper.bottomHideLevelUltraSoft = 4000;

			expect( helper.shouldHideItemsBelow() ).toBeTruthy();

			helper.bottomPlaceholderHeight = 1500;
			expect( helper.shouldHideItemsBelow() ).toBeFalsy();
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
			};
			const helper = new ScrollHelper( function ( ref ) {
				return preparedBounds[ ref ];
			} );
			helper.props = {
				items: range( 10 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 9,
			} );

			helper.containerBottom = 5000;
			helper.bottomHideLevelHard = 2000;
			helper.bottomPlaceholderHeight = 800;

			helper.hideItemsBelow();

			test( 'updated state', () => {
				expect( helper.stateUpdated ).toBeTruthy();
			} );

			test( 'created placeholder for 3 items', () => {
				expect( 2800 ).toEqual( helper.bottomPlaceholderHeight );
			} );

			test( 'hid 4 items', () => {
				expect( 5 ).toEqual( helper.lastRenderedIndex );
			} );

			test( 'stored hidden items height', () => {
				expect( {
					i6: 300,
					i7: 900,
					i8: 300,
					i9: 500,
				} ).toEqual( helper.itemHeights );
			} );
		} );

		describe( 'Completely below context', () => {
			const helper = new ScrollHelper(
				function () {
					return null;
				} // let it use guessed height
			);
			helper.props = {
				items: range( 2 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 1,
			} );

			helper.containerBottom = 5000;
			helper.bottomHideLevelHard = 2000;
			helper.bottomPlaceholderHeight = 800;

			helper.hideItemsBelow();

			test( 'created placeholder for 2 items', () => {
				expect( 1400 ).toEqual( helper.bottomPlaceholderHeight );
			} );

			test( 'hid all items', () => {
				expect( -1 ).toEqual( helper.lastRenderedIndex );
			} );
		} );

		test( 'Starts showing when placeholder top edge is above first hide limit', () => {
			const helper = new ScrollHelper();
			helper.containerBottom = 5000;
			helper.bottomPlaceholderHeight = 3500;
			helper.bottomHideLevelHard = 2000;

			expect( helper.shouldShowItemsBelow() ).toBeTruthy();

			helper.bottomPlaceholderHeight = 2500;
			expect( helper.shouldShowItemsBelow() ).toBeFalsy();
		} );

		describe( 'Showing batch of items', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 8 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 4,
			} );

			helper.containerBottom = 5000;
			helper.bottomHideLevelHard = 2000;
			helper.bottomHideLevelSoft = 3000;
			helper.bottomPlaceholderHeight = 3100;
			helper.itemHeights = {
				i5: 300,
				i6: 300,
				i7: 900,
			};
			// corresponding itemTops: 1900, 2200, 2500, 3400

			helper.showItemsBelow();

			test( 'updated state', () => {
				expect( helper.stateUpdated ).toBeTruthy();
			} );

			test( 'reduced placeholder height', () => {
				expect( 2500 ).toEqual( helper.bottomPlaceholderHeight );
			} );

			test( 'shown 2 items', () => {
				expect( 6 ).toEqual( helper.lastRenderedIndex );
			} );

			test( 'removed shown items height', () => {
				expect( {
					i7: 900,
				} ).toEqual( helper.itemHeights );
			} );
		} );

		describe( 'Show item longer than context', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 8 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 4,
			} );

			helper.containerBottom = 5000;
			helper.bottomHideLevelHard = 2000;
			helper.bottomHideLevelSoft = 3000;
			helper.bottomPlaceholderHeight = 3100;
			helper.itemHeights = {
				i5: 1200,
				i6: 300,
			};
			// corresponding itemTops: 3100, 3400

			helper.showItemsBelow();

			test( 'reduced placeholder height', () => {
				expect( 1900 ).toEqual( helper.bottomPlaceholderHeight );
			} );

			test( 'shown 2 items', () => {
				expect( 5 ).toEqual( helper.lastRenderedIndex );
			} );
		} );

		describe( 'Show new items', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 8 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 4,
			} );
			helper.containerBottom = 900;
			helper.bottomHideLevelHard = 2000;
			helper.bottomHideLevelSoft = 3000;
			helper.bottomPlaceholderHeight = 200;
			// stored item heighs left to default

			helper.showItemsBelow();

			test( 'placeholder height is never negative', () => {
				expect( 0 ).toEqual( helper.bottomPlaceholderHeight );
			} );

			test( 'container bottom is increased', () => {
				expect( 1600 ).toEqual( helper.containerBottom );
			} );

			test( 'shown 3 items', () => {
				expect( 7 ).toEqual( helper.lastRenderedIndex );
			} );
		} );

		test( 'Placeholder height is always zero if everything shown', () => {
			const helper = new ScrollHelper();
			helper.props = {
				items: range( 8 ),
				guessedItemHeight: 300,
				itemsPerRow: 1,
				getItemRef: getItemRef,
			};
			helper.reset( {
				lastRenderedIndex: 4,
			} );

			helper.containerBottom = 5000;
			helper.bottomHideLevelHard = 2000;
			helper.bottomHideLevelSoft = 3000;
			helper.bottomPlaceholderHeight = 4200;
			// stored item heighs left to default

			helper.showItemsBelow();

			expect( 0 ).toEqual( helper.bottomPlaceholderHeight );
			expect( 7 ).toEqual( helper.lastRenderedIndex );
		} );
	} );

	describe( 'Next page', () => {
		let helper;

		beforeEach( () => {
			helper = new ScrollHelper();
			helper.props = {
				fetchingNextPage: false,
				lastPage: false,
			};
			helper.updateContextHeight( 1000 );
			helper.bottomPlaceholderHeight = 0;
			helper.containerBottom = 1900;
			helper.bottomHideLevelHard = 2000;
		} );

		test( 'loaded when container bottom above hard limit', () => {
			expect( helper.shouldLoadNextPage() ).toBeTruthy();
		} );

		test( 'not loaded when loading previous', () => {
			helper.props.fetchingNextPage = true;
			expect( helper.shouldLoadNextPage() ).toBeFalsy();
		} );

		test( 'not loaded on last page', () => {
			helper.props.lastPage = true;
			expect( helper.shouldLoadNextPage() ).toBeFalsy();
		} );

		test( 'not loaded if some items hidden', () => {
			helper.bottomPlaceholderHeight = 100;
			expect( helper.shouldLoadNextPage() ).toBeFalsy();
		} );
	} );
} );
