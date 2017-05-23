/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

class DomainConnectAuthorizeConflicts extends Component {
	static propTypes = {
		conflictingRecords: PropTypes.array,
		isLoading: PropTypes.bool
	};

	static defaultProps = {
		conflictingRecords: [],
		isLoading: false
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span></span>
				<span></span>
			</div>
		);
	}

	render() {
		const { isLoading, conflictingRecords, translate } = this.props;

		if ( isLoading ) {
			return this.placeholder();
		}

		if ( conflictingRecords.length ) {
			return (
				<div>
					<p>
						{
							translate( 'To make the changes you want, we\'re going to have to replace the following ' +
								'DNS records for your domain:' )
						}
					</p>
					<ul className="domain-connect__dns-list">
						{
							conflictingRecords.map( ( record, index ) => {
								return (
									<li key={ index }>
										<div className="domain-connect__dns-list-type">
											<label>{ record.type }</label>
										</div>
										<div className="domain-connect__dns-list-info">
											<strong>{ record.name }</strong>
											<em>{ record.data }</em>
										</div>
									</li>
								);
							} )
						}
					</ul>
					<p>
						{
							translate( 'The services that these records were used for may no longer work if they ' +
								'are removed. If you are trying to switch from one service provider to another ' +
								'this is probably what you want to do.' )
						}
					</p>
				</div>
			);
		}

		return null;
	}
}

export default localize( DomainConnectAuthorizeConflicts );
