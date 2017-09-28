import debugFactory from 'debug';
const debug = debugFactory( 'calypso:poller' );

var DEFAULT_INTERVAL = 30000,
	_id = 0;

function Poller( dataStore, fetcher, options ) {
	options = options || {};

	this.id = _id;
	_id++;

	this.paused = false;
	this.initialized = false;

	this.startOnFirstChange = this.startOnFirstChange.bind( this );
	this.stopOnNoChangeListeners = this.stopOnNoChangeListeners.bind( this );

	this.interval = options.interval || DEFAULT_INTERVAL;

	this.pauseWhenHidden = true;
	if ( 'pauseWhenHidden' in options ) {
		this.pauseWhenHidden = options.pauseWhenHidden;
	}

	if ( options.leading !== undefined ) {
		this.leading = !! options.leading;
	} else {
		this.leading = true;
	}

	this.dataStore = dataStore;
	this.fetcher = fetcher;
	this.dataStore.on( 'newListener', this.startOnFirstChange );
	this.dataStore.on( 'removeListener', this.stopOnNoChangeListeners );

	if ( this.dataStore.listeners( 'change' ).length > 0 ) {
		this.start();
	}

	// Defer setting initialized until stack is cleared
	setTimeout( function() {
		this.initialized = true;
	}.bind( this ), 0 );
}

Poller.prototype.start = function() {
	var fetch = function() {
		debug( 'Calling fetcher for %o', { fetcher: this.fetcher, store: this.dataStore } );
		this.fetch();
	}.bind( this );

	if ( ! this.timer ) {
		debug( 'Starting poller for %o', this.dataStore );
		if ( this.leading || this.initialized ) {
			fetch();
		}
		this.timer = setInterval( fetch, this.interval );
		this.paused = false;
	}
};

Poller.prototype.stop = function() {
	if ( this.timer ) {
		debug( 'Stopping poller for %o', this.dataStore );
		clearInterval( this.timer );
		this.timer = false;
		this.paused = false;
	}
};

Poller.prototype.fetch = function() {
	if ( typeof this.fetcher === 'string' ) {
		this.dataStore[ this.fetcher ]();
	} else {
		this.fetcher.call( null );
	}
};

Poller.prototype.clear = function() {
	this.dataStore.off( 'newListener', this.startOnFirstChange );
	this.dataStore.off( 'removeListener', this.stopOnNoChangeListeners );
	this.stop();
};

Poller.prototype.startOnFirstChange = function( event ) {
	if ( event !== 'change' ) {
		return;
	}

	this.start();
};

Poller.prototype.stopOnNoChangeListeners = function( event ) {
	if ( event !== 'change' ) {
		return;
	}

	if ( this.dataStore.listeners( 'change' ).length === 0 ) {
		this.stop();
	}
};

module.exports = Poller;
