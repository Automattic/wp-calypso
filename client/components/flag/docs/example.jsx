/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Flag from '../index';

const FlagExamples = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

	render() {
		return (
			<div className="design-assets__group">
				<h2>Flag</h2>
				<div>
					<Flag type="is-success" icon="noticon-lock">
						Success flag with a lock icon.
					</Flag>
				</div>
				<div>
					<Flag type="is-warning" icon="noticon-warning">
						Warning flag with a warning icon.
					</Flag>
				</div>
				<div>
					<Flag type="is-error" icon="noticon-warning">
						Error flag with a warning icon.
					</Flag>
				</div>
			</div>
		);
	}
} );

module.exports = FlagExamples;
