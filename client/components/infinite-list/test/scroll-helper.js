/**
 * External dependencies
 */
import { assert } from 'chai';
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import ScrollHelper from '../scroll-helper';

function getItemRef( item ) {
	return 'i' + item;
}

describe( 'scroll-helper', function() {
	describe( 'Hide Levels', function() {
		describe( 'Context Higher than 5 items', function() {
			const helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 100,
				itemsPerRow: 1
			};
			helper.updateContextHeight( 1000 );

			it( 'top hard hide levels is 1 vh above context', function() {
				assert.equal( helper.topHideLevelHard, -1000 );
			} );
			it( 'top soft hide level is 2 vh above context', function() {
				assert.equal( helper.topHideLevelSoft, -2000 );
			} );
			it( 'bottom hard hide level is 1 vh below context', function() {
				assert.equal( helper.bottomHideLevelHard, 2000 );
			} );
			it( 'bottom soft hide level is 2 vh below context', function() {
				assert.equal( helper.bottomHideLevelSoft, 3000 );
			} );
			it( 'bottom 3rd hide level is 3 vh below context', function() {
				assert.equal( helper.bottomHideLevelUltraSoft, 4000 );
			} );
		} );

		describe( 'Context Shorter than 5 items', function() {
			const helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 100,
				itemsPerRow: 1
			};
			helper.updateContextHeight( 200 );

			it( 'top hard hide levels is 5 items above context', function() {
				assert.equal( helper.topHideLevelHard, -500 );
			} );
			it( 'top soft hide level is 10 items above context', function() {
				assert.equal( helper.topHideLevelSoft, -1000 );
			} );
			it( 'bottom hard hide level is 5 items below context', function() {
				assert.equal( helper.bottomHideLevelHard, 700 );
			} );
			it( 'bottom soft hide level is 10 items below context', function() {
				assert.equal( helper.bottomHideLevelSoft, 1200 );
			} );
			it( 'bottom 3rd hide level is 15 items below context', function() {
				assert.equal( helper.bottomHideLevelUltraSoft, 1700 );
			} );
		} );
	} );

	describe( 'Container and placeholder positioning', function() {
		let preparedBounds = {
				topPlaceholder: {
					top: -2000,
					height: 1000
				},
				bottomPlaceholder: {
					bottom: 4000,
					height: 2000
				}
			},
			helper = new ScrollHelper( function( ref ) {
				return preparedBounds[ ref ];
			}
			);

		helper.updatePlaceholderDimensions();

		it( 'Placeholders height determined using their bounds ', function() {
			assert.equal( helper.topPlaceholderHeight, 1000 );
			assert.equal( helper.bottomPlaceholderHeight, 2000 );
		} );

		it( 'Container top determined using top placeholder bounds', function() {
			assert.equal( helper.containerTop, -2000 );
		} );

		it( 'Container bottom determined using bottom placeholder bounds', function() {
			assert.equal( helper.containerBottom, 4000 );
		} );
	} );

	describe( 'Initial last rendered index', function() {
		let helper;
		beforeEach( function() {
			helper = new ScrollHelper();
			helper.props = {
				guessedItemHeight: 200,
				itemsPerRow: 1
			};
			helper.updateContextHeight( 1000 );
		} );

		it( 'renders only up to bottom soft hide level', function() {
			helper.props.items = range( 100 );
			assert.equal( helper.initialLastRenderedIndex(), 14 ); // 3000 / 200 - 1
		} );

		it( 'renders everything if it should fit', function() {
			helper.props.items = range( 10 );
			assert.equal( helper.initialLastRenderedIndex(), 9 );
		} );
	} );

	describe( 'Items Above', function() {
		it( 'Starts hiding when placeholder bottom edge is above soft level', function() {
			const helper = new ScrollHelper();
			helper.containerTop = -3000;
			helper.topPlaceholderHeight = 500;
			helper.topHideLevelSoft = -2000;

			assert.ok( helper.shouldHideItemsAbove() );

			helper.topPlaceholderHeight = 1500;
			assert.notOk( helper.shouldHideItemsAbove() );
		} );

		describe( 'Hiding batch of items', function() {
			let preparedBounds = {
					i0: {
						bottom: -1850
					},
					i1: {
						bottom: -1500
					},
					// i2: { bottom: -1200 }, Let it use guessedItemHeight for this one
					i3: {
						bottom: -900
					}
				},
				helper = new ScrollHelper( function( ref ) {
					return preparedBounds[ ref ];
				}
				);
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

			it( 'updated state', function() {
				assert( helper.stateUpdated );
			} );

			it( 'created placeholder for 3 items', function() {
				assert.equal( 900, helper.topPlaceholderHeight );
			} );

			it( 'hid 3 items', function() {
				assert.equal( 3, helper.firstRenderedIndex );
			} );

			it( 'stored hidden items height', function() {
				assert.deepEqual( {
					i0: 250,
					i1: 350,
					i2: 300
				}, helper.itemHeights );
			} );
		} );

		describe( 'Completely above context', function() {
			let preparedBounds = {
					i0: {
						bottom: -1850
					},
					i1: {
						bottom: -1500
					},
				},
				helper = new ScrollHelper( function( ref ) {
					return preparedBounds[ ref ];
				}
				);

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

			it( 'created placeholder for 2 items', function() {
				assert.equal( 600, helper.topPlaceholderHeight );
			} );

			it( 'hid 2 items', function() {
				assert.equal( 2, helper.firstRenderedIndex );
			} );
		} );

		it( 'Starts showing when placeholder bottom edge is below hard level', function() {
			const helper = new ScrollHelper();
			helper.containerTop = -3000;
			helper.topPlaceholderHeight = 2500;
			helper.topHideLevelHard = -1000;

			assert.ok( helper.shouldShowItemsAbove() );

			helper.topPlaceholderHeight = 1500;
			assert.notOk( helper.shouldShowItemsAbove() );
		} );

		describe( 'Showing batch of items', function() {
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
				i4: 300
			}; // i2 left to default

			helper.showItemsAbove();

			it( 'updated state', function() {
				assert( helper.stateUpdated );
			} );

			it( 'reduced placeholder height', function() {
				assert.equal( 250, helper.topPlaceholderHeight );
			} );

			it( 'shown 4 items', function() {
				assert.equal( 1, helper.firstRenderedIndex );
			} );

			it( 'removed shown items height', function() {
				assert.deepEqual( {
					i0: 250
				}, helper.itemHeights );
			} );
		} );

		describe( 'Show items when their real height is higher than stored', function() {
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

			it( 'placeholder height is never negative', function() {
				assert.equal( 0, helper.topPlaceholderHeight );
			} );

			it( 'shown all items', function() {
				assert.equal( 0, helper.firstRenderedIndex );
			} );
		} );

		it( 'removes placeholder if everything is shown', function() {
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

			assert.equal( 0, helper.topPlaceholderHeight );
		} );
	} );

	describe( 'Items Below', function() {
		it( 'Starts hiding when placholder top edge is below 3rd hide limit', function() {
			const helper = new ScrollHelper();
			helper.containerBottom = 5000;
			helper.bottomPlaceholderHeight = 500;
			helper.bottomHideLevelUltraSoft = 4000;

			assert.ok( helper.shouldHideItemsBelow() );

			helper.bottomPlaceholderHeight = 1500;
			assert.notOk( helper.shouldHideItemsBelow() );
		} );

		describe( 'Hiding batch of items', function() {
			let preparedBounds = {
					i5: {
						top: 1900
					},
					i6: {
						top: 2200
					},
					i7: {
						top: 2500
					},
					// i8: { top: 3400 }, Let it use guessedItemHeight for this one
					i9: {
						top: 3700
					}
				},
				helper = new ScrollHelper( function( ref ) {
					return preparedBounds[ ref ];
				}
				);
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

			it( 'updated state', function() {
				assert.ok( helper.stateUpdated );
			} );

			it( 'created placeholder for 3 items', function() {
				assert.equal( 2800, helper.bottomPlaceholderHeight );
			} );

			it( 'hid 4 items', function() {
				assert.equal( 5, helper.lastRenderedIndex );
			} );

			it( 'stored hidden items height', function() {
				assert.deepEqual( {
					i6: 300,
					i7: 900,
					i8: 300,
					i9: 500
				}, helper.itemHeights );
			} );
		} );

		describe( 'Completely below context', function() {
			const helper = new ScrollHelper( function() {
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

			it( 'created placeholder for 2 items', function() {
				assert.equal( 1400, helper.bottomPlaceholderHeight );
			} );

			it( 'hid all items', function() {
				assert.equal( -1, helper.lastRenderedIndex );
			} );
		} );

		it( 'Starts showing when placeholder top edge is above first hide limit', function() {
			const helper = new ScrollHelper();
			helper.containerBottom = 5000;
			helper.bottomPlaceholderHeight = 3500;
			helper.bottomHideLevelHard = 2000;

			assert.ok( helper.shouldShowItemsBelow() );

			helper.bottomPlaceholderHeight = 2500;
			assert.notOk( helper.shouldShowItemsBelow() );
		} );

		describe( 'Showing batch of items', function() {
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
				i7: 900
			};
			// corresponding itemTops: 1900, 2200, 2500, 3400

			helper.showItemsBelow();

			it( 'updated state', function() {
				assert( helper.stateUpdated );
			} );

			it( 'reduced placeholder height', function() {
				assert.equal( 2500, helper.bottomPlaceholderHeight );
			} );

			it( 'shown 2 items', function() {
				assert.equal( 6, helper.lastRenderedIndex );
			} );

			it( 'removed shown items height', function() {
				assert.deepEqual( {
					i7: 900
				}, helper.itemHeights );
			} );
		} );

		describe( 'Show item longer than context', function() {
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
				i6: 300
			};
			// corresponding itemTops: 3100, 3400

			helper.showItemsBelow();

			it( 'reduced placeholder height', function() {
				assert.equal( 1900, helper.bottomPlaceholderHeight );
			} );

			it( 'shown 2 items', function() {
				assert.equal( 5, helper.lastRenderedIndex );
			} );
		} );

		describe( 'Show new items', function() {
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

			it( 'placeholder height is never negative', function() {
				assert.equal( 0, helper.bottomPlaceholderHeight );
			} );

			it( 'container bottom is increased', function() {
				assert.equal( 1600, helper.containerBottom );
			} );

			it( 'shown 3 items', function() {
				assert.equal( 7, helper.lastRenderedIndex );
			} );
		} );

		it( 'Placeholder height is always zero if everything shown', function() {
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

			assert.equal( 0, helper.bottomPlaceholderHeight );
			assert.equal( 7, helper.lastRenderedIndex );
		} );
	} );

	describe( 'Next page', function() {
		let helper;

		beforeEach( function() {
			helper = new ScrollHelper();
			helper.props = {
				fetchingNextPage: false,
				lastPage: false
			};
			helper.updateContextHeight( 1000 );
			helper.bottomPlaceholderHeight = 0;
			helper.containerBottom = 1900;
			helper.bottomHideLevelHard = 2000;
		} );

		it( 'loaded when container bottom above hard limit', function() {
			assert.ok( helper.shouldLoadNextPage() );
		} );

		it( 'not loaded when loading previous', function() {
			helper.props.fetchingNextPage = true;
			assert.notOk( helper.shouldLoadNextPage() );
		} );

		it( 'not loaded on last page', function() {
			helper.props.lastPage = true;
			assert.notOk( helper.shouldLoadNextPage() );
		} );

		it( 'not loaded if some items hidden', function() {
			helper.bottomPlaceholderHeight = 100;
			assert.notOk( helper.shouldLoadNextPage() );
		} );
	} );
} );
