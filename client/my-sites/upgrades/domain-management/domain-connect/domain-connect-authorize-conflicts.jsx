/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

class DomainConnectAuthorizeConflicts extends Component {
	placeholder = () => {
		return (
			<div>
				<div className="domain-connect__is-placeholder">
					<span></span>
					<span></span>
				</div>
			</div>
		);
	}

	render() {
		const { isPlaceholder, conflictingRecords, translate } = this.props;

		if ( isPlaceholder ) {
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
					<div className="domain-connect__dns-list">
						<ul>
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
					</div>
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

DomainConnectAuthorizeConflicts.propTypes = {
	conflictingRecords: PropTypes.array,
	isPlaceholder: PropTypes.bool
};

DomainConnectAuthorizeConflicts.defaultProps = {
	conflictingRecords: [],
	isPlaceholder: false
};

export default localize( DomainConnectAuthorizeConflicts );
