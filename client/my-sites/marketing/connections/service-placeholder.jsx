/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import GridIcon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FoldableCard from 'calypso/components/foldable-card';

class SharingServicePlaceholder extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	render() {
		const header = (
			<div>
				<GridIcon icon="share" size={ 48 } className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h2 />
					<p className="sharing-service__description" />
				</div>
			</div>
		);

		const summary = (
			<Button compact disabled>
				{ this.props.translate( 'Loading' ) }
			</Button>
		);

		return (
			<li className="sharing-service is-placeholder">
				<FoldableCard header={ header } summary={ summary } className="sharing-service" compact>
					<div />
				</FoldableCard>
			</li>
		);
	}
}

export default localize( SharingServicePlaceholder );
