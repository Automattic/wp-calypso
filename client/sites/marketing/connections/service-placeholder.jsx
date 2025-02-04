/* eslint-disable jsx-a11y/heading-has-content */
import { Button, Gridicon, FoldableCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

class SharingServicePlaceholder extends Component {
	static propTypes = {
		translate: PropTypes.func,
	};

	render() {
		const header = (
			<div>
				<Gridicon icon="share" size={ 48 } className="sharing-service__logo" />

				<div className="sharing-service__name">
					<h3 />
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
