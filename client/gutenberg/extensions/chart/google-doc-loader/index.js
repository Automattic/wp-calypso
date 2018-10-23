/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */

import { assign } from 'lodash';

export class GoogleDocLoader {
	constructor( options ) {
		const { url } = options;
		this.options = assign( this.options, options );
		const key = this.extractKeyFromUrl( url );
		this.fetch( key );
	}
	options = {
		success: null,
		error: null,
		url: null,
		context: null,
	};
	extractKeyFromUrl = function( url ) {
		if ( /pubhtml/.test( url ) ) {
			return url.match( 'd\\/(.*?)\\/pubhtml' )[ 1 ];
		} else if ( /spreadsheets\/d/.test( url ) ) {
			return url.match( 'd\\/(.*?)/' )[ 1 ];
		} else if ( /key=/.test( url ) ) {
			return url.this.key.match( 'key=(.*?)(&|#|$)' )[ 1 ];
		}
		// console.log('Couldn\'t parse chart URL');
		return null;
	};
	fetch( key ) {
		const worksheetAPI =
			this.apis.base + this.apis.worksheets + key + this.apis.suffix + this.apis.query;
		this.options.jQuery
			.ajax( {
				url: worksheetAPI,
				context: this,
			} )
			.success( function( data ) {
				const cellsAPI = this.extractChartIDFromWorksheetsResponse( data );
				if ( cellsAPI ) {
					this.fetchCells( cellsAPI + this.apis.query );
				}
			} )
			.error( function( data ) {
				if ( this.options.error ) {
					this.options.error( data.statusText );
				}
			} );
	}
	apis = {
		base: 'https://spreadsheets.google.com/',
		worksheets: 'feeds/worksheets/',
		cells: 'feeds/cells/',
		suffix: '/public/values',
		query: '?alt=json',
	};
	rel = {
		cells: 'http://schemas.google.com/spreadsheets/2006#cellsfeed',
	};

	fetchCells( cellsAPI ) {
		this.options.jQuery
			.ajax( {
				url: cellsAPI,
				context: this,
			} )
			.success( function( data ) {
				const parsedData = this.parseSheet( data );
				/* Size sanity check */
				if ( parsedData.info.colCount > 100 || parsedData.info.rowCount > 100 ) {
					if ( this.options.error ) {
						this.options.error( {
							error: 'sheet_too_big',
						} );
					}
				} else if ( this.options.success ) {
					this.options.success( parsedData );
				}
			} )
			.error( function( data ) {
				if ( this.options.error ) {
					this.options.error( data.statusText );
				}
			} );
	}
	extractChartIDFromWorksheetsResponse( data ) {
		const links = [];
		for ( const a in data.feed.entry ) {
			const entry = data.feed.entry[ a ];
			for ( const b in entry.link ) {
				if ( entry.link[ b ].rel === this.rel.cells ) {
					links.push( entry.link[ b ].href );
				}
			}
		}

		return links[ 0 ];
	}
	parseCell = function( text ) {
		if ( this.options.context === 'table' ) {
			return text;
		}

		return parseFloat( text.replace( ',', '' ) );
	};
	parseSheet( data ) {
		const parsedData = {
			info: {
				rowCount: 0,
				colCount: 0,
			},
			rows: [],
		};
		let lastCol = 0;
		let lastRow = 1;
		for ( const key in data.feed.entry ) {
			const entry = data.feed.entry[ key ];
			const row = parseInt( entry.gs$cell.row );
			const col = parseInt( entry.gs$cell.col );
			let text = entry.content.$t;

			if ( row > lastRow ) {
				lastCol = 0;
			}

			const rowIndex = row - 1;
			if ( typeof parsedData.rows[ rowIndex ] === 'undefined' ) {
				parsedData.rows[ rowIndex ] = {
					info: {
						gaIndex: row,
					},
					cells: [],
				};
			}

			for ( let a = 1; a < col - lastCol; a++ ) {
				parsedData.rows[ rowIndex ].cells.push( '' );
			}

			if ( rowIndex > 0 && parsedData.rows[ rowIndex ].cells.length > 0 ) {
				text = this.parseCell( text );
			}

			parsedData.rows[ rowIndex ].cells.push( text );
			if ( row > parsedData.info.rowCount ) {
				parsedData.info.rowCount = row;
			}

			if ( col > parsedData.info.colCount ) {
				parsedData.info.colCount = col;
			}

			lastCol = col;
			lastRow = row;
		}

		// Add additional cells at the end of rows
		for ( let i = 0; i < parsedData.rows.length; i++ ) {
			if ( typeof parsedData.rows[ i ] === 'undefined' ) {
				parsedData.rows[ i ] = {
					info: {},
					cells: [],
				};

				for ( let a = 0; a < parsedData.info.colCount; a++ ) {
					parsedData.rows[ i ].cells.push( '' );
				}
			} else if ( parsedData.rows[ i ].cells.length < parsedData.info.colCount ) {
				const difference = parsedData.info.colCount - parsedData.rows[ i ].cells.length;
				for ( let b = 0; b < difference; b++ ) {
					parsedData.rows[ i ].cells.push( '' );
				}
			}
		}
		return parsedData;
	}
}

export default GoogleDocLoader;
