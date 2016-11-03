/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import GridIcon from 'components/gridicon';

class SharingServicePlaceholder extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	render() {
		const header = (
			<div>
				<GridIcon
					icon="share"
					size={ 48 }
					className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h2 />
					<p className="sharing-service__description" />
				</div>
			</div>
		);

		const summary = (
			<Button compact disabled>{ this.props.translate( 'Loading' ) }</Button>
		);

		return (
			<li className="sharing-service is-placeholder">
				<FoldableCard
					header={ header }
					summary={ summary }
					className="sharing-service"
					compact>
					<div />
				</FoldableCard>
			</li>
		);
	}
}

export default localize( SharingServicePlaceholder );
