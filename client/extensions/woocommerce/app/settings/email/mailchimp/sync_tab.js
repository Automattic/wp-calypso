/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Notice from 'components/notice';
import TooltipComponent from 'components/tooltip';

class Tooltip extends React.Component {
	constructor( props ) {
		super( props );
		this.state = { show: false };
		this.tooltipRef = React.createRef();
	}

	open = ( e ) => {
		const isTruncated = e.target.offsetWidth < e.target.scrollWidth;
		this.setState( { show: isTruncated } );
	};

	close = () => {
		this.setState( { show: false } );
	};

	render() {
		return (
			<Fragment>
				<div
					className="mailchimp__sync-notice-list"
					onMouseEnter={ this.open }
					onMouseLeave={ this.close }
					ref={ this.tooltipRef }
				>
					{ this.props.children }
				</div>
				<TooltipComponent
					isVisible={ this.state.show }
					onClose={ this.close }
					position={ 'top' }
					context={ this.tooltipRef.current }
				>
					<div>{ this.props.listName }</div>
				</TooltipComponent>
			</Fragment>
		);
	}
}

const SyncTab = localize( ( { siteId, translate, syncState, resync, isRequesting } ) => {
	const {
		account_name,
		store_syncing,
		product_count,
		mailchimp_total_products,
		mailchimp_total_orders,
		order_count,
	} = syncState;
	const hasProductInfo = undefined !== product_count && undefined !== mailchimp_total_products;
	const products = hasProductInfo ? mailchimp_total_products + '/' + product_count : '';
	const hasOrdersInfo = undefined !== order_count && undefined !== mailchimp_total_orders;
	const orders = hasOrdersInfo ? mailchimp_total_orders + '/' + order_count : '';

	const synced = () => (
		<Notice
			status="is-success"
			isCompact
			showDismiss={ false }
			text={ translate(
				'{{div}}{{tooltip}}%(mailingListname)s{{/tooltip}} {{div_info}}list synced.{{/div_info}}{{/div}}',
				{
					components: {
						div: <div className="mailchimp__sync-notice-content" />,
						div_info: <span className="mailchimp__sync-notice-info" />,
						tooltip: <Tooltip listName={ syncState.mailchimp_list_name } />,
					},
					args: { mailingListname: syncState.mailchimp_list_name },
				}
			) }
		/>
	);
	const syncing = () => (
		<Notice
			className="mailchimp__sync-notice-syncing"
			status="is-info"
			isCompact
			showDismiss={ false }
			text={ translate(
				'{{div}}{{tooltip}}%(mailingListname)s{{/tooltip}} {{div_info}}list is being synced.{{/div_info}}{{/div}}',
				{
					components: {
						div: <div className="mailchimp__sync-notice-content" />,
						div_info: <span className="mailchimp__sync-notice-info" />,
						tooltip: <Tooltip listName={ syncState.mailchimp_list_name } />,
					},
					args: { mailingListname: syncState.mailchimp_list_name },
				}
			) }
		/>
	);

	const loadingSyncStatus = () => (
		<Notice isCompact showDismiss={ false } text={ translate( 'Loading sync status.' ) } />
	);

	const onResyncClick = () => {
		! store_syncing && resync( siteId );
	};

	const notice = ( () => {
		if ( isRequesting && isEmpty( syncState ) ) {
			return loadingSyncStatus();
		}
		return store_syncing ? syncing() : synced();
	} )();

	return (
		<div>
			<div className="mailchimp__account-info-name">
				{ translate(
					'{{span_info}}MailChimp account:{{/span_info}} {{span}}%(account_name)s{{/span}}',
					{
						components: {
							span_info: <span className="mailchimp__account-info" />,
							span: <span />,
						},
						args: {
							account_name,
						},
					}
				) }
			</div>
			<span className="mailchimp__sync-status">
				{ notice }
				<Button borderless className="mailchimp__resync-link" onClick={ onResyncClick }>
					{ translate( 'Resync', { comment: 'to synchronize again' } ) }
				</Button>
			</span>
			<div className="mailchimp__account-data">
				{ translate( '{{span_info}}Products:{{/span_info}} {{span}}%(products)s{{/span}}', {
					components: {
						span_info: <span className="mailchimp__account-info" />,
						span: <span />,
					},
					args: {
						products,
					},
				} ) }
				{ translate( '{{span_info}}Orders:{{/span_info}} {{span}}%(orders)s{{/span}}', {
					components: {
						span_info: <span className="mailchimp__account-info-orders" />,
						span: <span />,
					},
					args: {
						orders,
					},
				} ) }
			</div>
		</div>
	);
} );

SyncTab.propTypes = {
	siteId: PropTypes.number.isRequired,
	syncState: PropTypes.object,
	isRequestingSettings: PropTypes.bool,
	resync: PropTypes.func.isRequired,
};

export default SyncTab;
