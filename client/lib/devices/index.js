/**
 * External dependencies
 */
var debug = require('debug')('calypso:user:devices');

/**
 * Internal dependencies
 */
var Emitter = require('lib/mixins/emitter'), wpcom = require('lib/wp').undocumented();

function Devices() {
    if (!(this instanceof Devices)) {
        return new Devices();
    }

    this.devices = false;
    this.initialized = false;
    this.fetchingDevices = false;
}

Emitter(Devices.prototype);

/**
 * Get user data
 */
Devices.prototype.get = function() {
    if (!this.devices) {
        this.fetch();
    }
    return this.devices;
};

/**
 * Fetch user devices from WordPress.com API and store them in Devices instance
 */
Devices.prototype.fetch = function() {
    if (this.fetchingDevices) {
        return;
    }

    this.fetchingDevices = true;
    debug('Fetching user devices.');
    wpcom.me().devices(
        function(error, data) {
            if (!error) {
                this.devices = data;
                this.initialized = true;
                this.emit('change');
            }

            this.fetchingDevices = false;

            debug('Devices successfully retrieved');
        }.bind(this)
    );
};

module.exports = Devices;
