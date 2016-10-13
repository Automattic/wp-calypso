/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Version from 'components/version';

export default React.createClass( {

	displayName: 'Version',

	mixins: [ PureRenderMixin ],

	render() {
		return (
			<div>
				<Version icon="my-sites" version={ 4.4 } />
				<Version icon="plugins" version={ 3.8 } />
			</div>
		);
	}
} );
