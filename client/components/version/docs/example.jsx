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
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/version">Version</a>
				</h2>
				<Version icon="my-sites" version={ 4.4 } />
				<Version icon="plugins" version={ 3.8 } />
			</div>
		);
	}
} );
