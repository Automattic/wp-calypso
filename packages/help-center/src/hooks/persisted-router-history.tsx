interface FakeWindow {
	location: {
		hash: string;
	} & Location;
	history: {
		state: any;
		stack: Array< { state: any; url: string } >;
		go: ( n: number ) => void;
		replaceState: ( state: any ) => void;
		pushState: ( state: any, title: string, url: string ) => void;
		callback?: ( event: { state: any } ) => void;
	};
	document: Pick< Document, 'querySelector' >;
	addEventListener: ( event: string, callback: () => void ) => void;
	removeEventListener: () => void;
}

const fakeWindow: FakeWindow = {
	location: {
		...window.location,
		get hash() {
			return fakeWindow.history.stack[ fakeWindow.history.stack.length - 1 ]?.url || '';
		},
	},
	history: {
		stack: new Proxy( JSON.parse( localStorage.getItem( 'history' ) || '[]' ), {
			get: ( target, prop ) => {
				if ( prop === 'length' ) {
					return target.length;
				}
				return target[ prop ];
			},
			set: ( target, prop, value ) => {
				localStorage.setItem( 'history', JSON.stringify( target ) );
				return Reflect.set( target, prop, value );
			},
		} ),
		get state() {
			return fakeWindow.history.stack[ fakeWindow.history.stack.length - 1 ]?.state;
		},
		go: ( n: number ) => {
			fakeWindow.history.stack.splice( n, Math.abs( n ) );
			fakeWindow.history.callback?.( {
				state: fakeWindow.history.state,
			} );
		},
		replaceState: ( state ) => {
			fakeWindow.history.stack.push( { state, url: '' } );
		},
		pushState: ( state, _title, url ) => {
			fakeWindow.history.stack.push( { state, url } );
		},
	},
	document: {
		querySelector: window.document.querySelector.bind( window.document ),
	},
	addEventListener: ( _event: string, callback: () => void ) => {
		fakeWindow.history.callback = callback;
	},
	removeEventListener: () => {
		fakeWindow.history.callback = undefined;
	},
};

export default fakeWindow;
