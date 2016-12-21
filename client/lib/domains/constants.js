/**
 * External dependencies
 */
import keyMirror from 'key-mirror';

const type = keyMirror( {
	MAPPED: null,
	REGISTERED: null,
	SITE_REDIRECT: null,
	WPCOM: null
} );

const registrar = {
	OPENHRS: 'OpenHRS',
	OPENSRS: 'OpenSRS',
	WWD: 'WWD',
	MAINTENANCE: 'Registrar TLD Maintenance'
};

export default {
	type,
	registrar
};
