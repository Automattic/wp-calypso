import path from 'path';

function toJSON( val ) {
	return JSON.stringify( val );
}

export default {
	INVALID_PATH: {
		existsSync: () => false,
		readFileSync: () => ''
	},

	VALID_SECRETS: {
		existsSync: ( file ) => {
			switch ( path.basename( file ) ) {
				case 'secrets.json':
				case 'empty-secrets.json':
					return true;
			}

			return false;
		},
		readFileSync: ( file ) => {
			switch ( path.basename( file ) ) {
				case 'secrets.json':
					return toJSON( {
						secret: 'very'
					} );

				case 'empty-secrets.json':
					return toJSON( {
						secret: 'fromempty'
					} );
			}

			return '';
		}
	},

	VALID_ENV_FILES: {
		existsSync: ( file ) => {
			switch ( path.basename( file ) ) {
				case '_shared.json':
				case 'myenv.json':
				case 'myenv.local.json':
					return true;
			}

			return false;
		},

		readFileSync: ( file ) => {
			switch ( path.basename( file ) ) {
				case '_shared.json':
					return toJSON( {
						shared_only: 'shared',
						myenv_override: 'shared',
						features: {
							enabledFeature1: true,
							disabledFeature1: false,
							enabledFeature2: true,
							disabledFeature2: false
						}
					} );
				case 'myenv.json':
					return toJSON( {
						myenv_only: 'myenv',
						myenv_override: 'myenv',
						myenvlocal_override: 'myenv'
					} );
				case 'myenv.local.json':
					return toJSON( {
						myenvlocal_only: 'myenvlocal',
						myenvlocal_override: 'myenvlocal'
					} );
			}

			return '';
		}
	}
}
