// See https://leeoniya.github.io/uPlot/demos/lib/quadtree.js

const MAX_OBJECTS = 10;
const MAX_LEVELS = 4;

export default function Quadtree( x, y, w, h, l ) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.l = l || 0;
	this.o = [];
	this.q = null;
}

const proto = {
	split: function () {
		const x = this.x;
		const y = this.y;
		const w = this.w / 2;
		const h = this.h / 2;
		const l = this.l + 1;

		this.q = [
			// top right
			new Quadtree( x + w, y, w, h, l ),
			// top left
			new Quadtree( x, y, w, h, l ),
			// bottom left
			new Quadtree( x, y + h, w, h, l ),
			// bottom right
			new Quadtree( x + w, y + h, w, h, l ),
		];
	},

	// invokes callback with index of each overlapping quad
	quads: function ( x, y, w, h, cb ) {
		const q = this.q;
		const hzMid = this.x + this.w / 2;
		const vtMid = this.y + this.h / 2;
		const startIsNorth = y < vtMid;
		const startIsWest = x < hzMid;
		const endIsEast = x + w > hzMid;
		const endIsSouth = y + h > vtMid;

		// top-right quad
		startIsNorth && endIsEast && cb( q[ 0 ] );
		// top-left quad
		startIsWest && startIsNorth && cb( q[ 1 ] );
		// bottom-left quad
		startIsWest && endIsSouth && cb( q[ 2 ] );
		// bottom-right quad
		endIsEast && endIsSouth && cb( q[ 3 ] );
	},

	add: function ( o ) {
		if ( this.q != null ) {
			this.quads( o.x, o.y, o.w, o.h, ( q ) => {
				q.add( o );
			} );
		} else {
			const os = this.o;

			os.push( o );

			if ( os.length > MAX_OBJECTS && this.l < MAX_LEVELS ) {
				this.split();

				for ( let i = 0; i < os.length; i++ ) {
					const oi = os[ i ];

					this.quads( oi.x, oi.y, oi.w, oi.h, ( q ) => {
						q.add( oi );
					} );
				}

				this.o.length = 0;
			}
		}
	},

	get: function ( x, y, w, h, cb ) {
		const os = this.o;

		for ( let i = 0; i < os.length; i++ ) {
			cb( os[ i ] );
		}

		if ( this.q != null ) {
			this.quads( x, y, w, h, ( q ) => {
				q.get( x, y, w, h, cb );
			} );
		}
	},

	clear: function () {
		this.o.length = 0;
		this.q = null;
	},
};

Object.assign( Quadtree.prototype, proto );
