/**
 * External dependencies
 */
var React = require( 'react' );

import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import GridIcon from 'components/gridicon';

module.exports = React.createClass( {
	displayName: 'SharingServicePlaceholder',

	render: function() {

		const header = (
			<div>
				<GridIcon
					icon="share"
					size={ 48 }
					className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h2></h2>
					<p className="sharing-service__description"></p>
				</div>
			</div>
		);

		const summary = (
			<Button
				compact
				disabled
				>{ this.translate( 'Loading' ) }</Button>
		);


		return (
			<li className="sharing-service is-placeholder">
				<FoldableCard
					header={ header }
					summary={ summary }
					className="sharing-service"
					compact
					>
					<div></div>
				</FoldableCard>
			</li>
		);
	}
} );
