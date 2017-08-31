/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { decodeEntities, stripHTML } from 'lib/formatting';

class OrderNote extends Component {
	static propTypes = {
		customer_note: PropTypes.bool,
		date_created_gmt: PropTypes.string,
		note: PropTypes.string.isRequired,
	}

	render() {
		const {
			customer_note,
			date_created_gmt,
			note,
			moment,
			translate
		} = this.props;

		const createdMoment = date_created_gmt ? moment( date_created_gmt + 'Z' ) : moment();

		// @todo Add comment author once we have that info
		let icon = 'aside';
		let note_type = translate( 'Internal note' );
		if ( customer_note ) {
			icon = 'mail';
			note_type = translate( 'Note sent to customer' );
		}

		return (
			<div className="activity-log__note">
				<div className="activity-log__note-meta">
					<span className="activity-log__note-time">{ createdMoment.format( 'LT' ) }</span>
					<Gridicon icon={ icon } size={ 24 } />
				</div>
				<div className="activity-log__note-body">
					<div className="activity-log__note-type">{ note_type }</div>
					<div className="activity-log__note-content">
						{ decodeEntities( stripHTML( note ) ) }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( OrderNote );
