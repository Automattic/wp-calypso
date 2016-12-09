const getWorker = ( () => {
	let worker;

	function createWorker() {
		const blob = new Blob( [ `
			importScripts( 'https://cdnjs.cloudflare.com/ajax/libs/localforage/1.4.3/localforage.js' );

			onmessage = function( event ) {
				switch ( event.data.type ) {
					case 'PERSIST':
						localforage.setItem( '__REDUX_STATE', event.data.state, function( error, value ) {
							postMessage( {
								id: event.data.id,
								error: error,
								value: value
							} );
						} );
						break;

					case 'RETRIEVE':
						localforage.getItem( '__REDUX_STATE', function( error, value ) {
							postMessage( {
								id: event.data.id,
								error: error,
								value: value
							} );
						} );
						break;

				}
			};
		` ], { type: 'application/javascript' } );

		worker = new Worker( URL.createObjectURL( blob ) );

		const callbacks = [];
		worker.onmessage = ( { data } ) => {
			if ( data && callbacks[ data.id ] ) {
				callbacks[ data.id ]( data );
				delete callbacks[ data.id ];
			}
		};

		const _postMessage = worker.postMessage.bind( worker );
		worker.postMessage = ( message ) => {
			return new Promise( ( resolve, reject ) => {
				callbacks.push( ( { error, value } ) => {
					if ( error ) {
						reject( error );
					} else {
						resolve( value );
					}
				} );

				_postMessage( {
					...message,
					id: callbacks.length - 1
				} );
			} );
		};
	}

	return () => {
		if ( ! worker ) {
			createWorker();
		}

		return worker;
	};
} )();

export function getState() {
	return getWorker().postMessage( {
		type: 'RETRIEVE'
	} );
}

export function setState( state ) {
	return getWorker().postMessage( {
		type: 'PERSIST',
		state
	} );
}
