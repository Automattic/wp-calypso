/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { trademarkNoticeText } from './trademark-constants';
import { Button, CompactCard } from '@automattic/components';
import TrademarkClaim from './trademark-claim';

class TrademarkNotice extends React.Component {
	static propTypes = {
		buttonsEnabled: PropTypes.bool.isRequired,
		onAccept: PropTypes.func.isRequired,
		onReject: PropTypes.func.isRequired,
		trademarkClaimsInfo: PropTypes.object.isRequired,
	};

	getAsArray = ( data ) => {
		return Array.isArray( data ) ? data : [ data ];
	};

	renderClaims = () => {
		const { trademarkClaimsInfo } = this.props;
		const { claim: claims } = trademarkClaimsInfo;

		return (
			<ol>
				{ this.getAsArray( claims ).map( ( claim, index ) => (
					<li className="trademark-claims-notice__claim" key={ index }>
						<TrademarkClaim trademarkClaim={ claim } />
					</li>
				) ) }
			</ol>
		);
	};

	renderNoticeActions = () => {
		const { buttonsEnabled, onAccept, onReject, translate } = this.props;

		return (
			<div className="trademark-claims-notice__layout">
				<div className="trademark-claims-notice__actions-background">
					<CompactCard className="trademark-claims-notice__actions">
						<Button borderless onClick={ onReject } disabled={ ! buttonsEnabled }>
							{ translate( 'Choose Another Domain' ) }
						</Button>
						<Button primary onClick={ onAccept } disabled={ ! buttonsEnabled }>
							{ translate( 'Acknowledge Trademark' ) }
						</Button>
					</CompactCard>
				</div>
			</div>
		);
	};

	render() {
		return (
			<Fragment>
				<CompactCard className="trademark-claims-notice__content">
					{ trademarkNoticeText }
					{ this.renderClaims() }
				</CompactCard>
				{ this.renderNoticeActions() }
			</Fragment>
		);
	}
}

export default localize( TrademarkNotice );
