/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { trademarkDecisionText } from './trademark-constants';

class TrademarkClaim extends React.Component {
	static propTypes = {
		trademarkClaim: PropTypes.object.isRequired,
	};

	renderItemLabel = ( label ) => (
		<span className="trademark-claims-notice__claim-item-label">{ label + ': ' }</span>
	);

	renderItemData = ( data ) => (
		<span className="trademark-claims-notice__claim-item-data">{ data }</span>
	);

	renderItem = ( key, label, data ) => (
		<div className="trademark-claims-notice__claim-item" key={ key }>
			{ label && this.renderItemLabel( label ) }
			{ data && this.renderItemData( data ) }
		</div>
	);

	renderListItem = ( key, data ) => (
		<li className="trademark-claims-notice__claim-item-data" key={ key }>
			{ data }
		</li>
	);

	renderList = ( list ) => (
		<ul className="trademark-claims-notice__claim-item-list">
			{ list.map( ( item, index ) => item && this.renderListItem( index, item ) ) }
		</ul>
	);

	renderMark = ( claim ) => {
		const { markName } = claim;
		return markName && this.renderItem( 'mark-name', 'Mark', markName );
	};

	renderJurisdiction = ( claim ) => {
		const { jurDesc } = claim;
		return jurDesc && this.renderItem( 'jurisdiction', 'Jurisdiction', jurDesc );
	};

	renderGoodsAndServices = ( claim ) => {
		const goodsAndServices = get( claim, 'goodsAndServices' );

		return (
			goodsAndServices &&
			this.renderItem(
				'goods-and-services',
				'Goods and Services',
				this.renderList( goodsAndServices )
			)
		);
	};

	renderInternationalClassification = ( claim ) => {
		const classDesc = get( claim, 'classDesc' );

		return (
			classDesc &&
			this.renderItem(
				'international-classification',
				'International Class of Goods and Services or Equivalent if applicable',
				this.renderList( classDesc )
			)
		);
	};

	renderContactInfo = ( contact ) => {
		if ( ! contact ) {
			return;
		}

		const addr = get( contact, 'addr' );

		const contactData = [];
		contact.name && contactData.push( this.renderItem( 'name', 'Name', contact.name ) );
		contact.org && contactData.push( this.renderItem( 'org', 'Organization', contact.org ) );
		addr.street &&
			addr.street.map(
				( street, index ) =>
					street && contactData.push( this.renderItem( 'street' + index, 'Address', street ) )
			);
		addr.city && contactData.push( this.renderItem( 'city', 'City', addr.city ) );
		addr.sp && contactData.push( this.renderItem( 'sp', 'State', addr.sp ) );
		addr.pc && contactData.push( this.renderItem( 'pc', 'Postal Code', addr.pc ) );
		addr.cc && contactData.push( this.renderItem( 'cc', 'Country', addr.cc ) );
		contact.voice && contactData.push( this.renderItem( 'voice', 'Phone', contact.voice ) );
		contact.fax && contactData.push( this.renderItem( 'fax', 'Fax', contact.fax ) );
		contact.email && contactData.push( this.renderItem( 'email', 'Email', contact.email ) );

		return this.renderList( contactData );
	};

	renderRegistrant = ( claim ) => {
		const holder = get( claim, 'holder' );
		return (
			holder &&
			this.renderItem( 'holder', 'Trademark Registrant', this.renderContactInfo( holder ) )
		);
	};

	renderContact = ( claim ) => {
		const contact = get( claim, 'contact' );
		return contact && this.renderItem( 'contact', 'Contact', this.renderContactInfo( contact ) );
	};

	renderCourtCases = ( courtCases ) => {
		return courtCases.map( ( courtCase, index ) =>
			this.renderItem(
				index,
				null,
				this.renderList( [
					this.renderItem( 'ref-num', 'Reference Number', courtCase.refNum ),
					this.renderItem( 'cc', 'Jurisdiction', courtCase.cc ),
					this.renderItem( 'court-name', 'Court Name', courtCase.courtName ),
				] )
			)
		);
	};

	renderUdrpCases = ( udrpCases ) => {
		return udrpCases.map( ( udrpCase, index ) =>
			this.renderItem(
				index,
				null,
				this.renderList( [
					this.renderItem( 'case-no', 'Case Number', udrpCase.caseNo ),
					this.renderItem( 'udrp-provider', 'UDRP Provider', udrpCase.udrpProvider ),
				] )
			)
		);
	};

	renderCases = ( claim ) => {
		const notExactMatch = get( claim, 'notExactMatch' );

		if ( ! notExactMatch ) {
			return;
		}

		const courtCases = get( notExactMatch, 'court' );
		const udrpCases = get( notExactMatch, 'udrp' );

		return (
			<div className="trademark-claims-notice__claim-item" key="claim-cases">
				{ trademarkDecisionText }
				{ courtCases && this.renderCourtCases( courtCases ) }
				{ udrpCases && this.renderUdrpCases( udrpCases ) }
			</div>
		);
	};

	render() {
		const { trademarkClaim } = this.props;

		return (
			<Fragment>
				{ this.renderMark( trademarkClaim ) }
				{ this.renderJurisdiction( trademarkClaim ) }
				{ this.renderGoodsAndServices( trademarkClaim ) }
				{ this.renderInternationalClassification( trademarkClaim ) }
				{ this.renderRegistrant( trademarkClaim ) }
				{ this.renderContact( trademarkClaim ) }
				{ this.renderCases( trademarkClaim ) }
			</Fragment>
		);
	}
}

export default localize( TrademarkClaim );
