import { __ } from '@wordpress/i18n';
import { ReactNode } from 'react';
import { TRADE_MARK_CLAIMS_MODAL_COPY } from './constants';
import type {
	TrademarkClaim,
	TrademarkClaimContact,
	TrademarkClaimCourtCase,
	TrademarkClaimsNoticeInfo,
	TrademarkClaimUdrpCase,
} from '@automattic/api-core';

const renderItemLabel = ( label: string ) => (
	<span className="domain-search-trademark-claims-modal__content-claim-item-label">
		{ label + ': ' }
	</span>
);

const renderItem = ( key: string | number, label: string | null, data: ReactNode ) => (
	<div key={ key }>
		{ label && renderItemLabel( label ) }
		{ data }
	</div>
);

const renderListItem = ( key: string | number, data: ReactNode ) => <li key={ key }>{ data }</li>;

const renderList = ( list: ReactNode[] ) => (
	<ul>{ list.map( ( item, index ) => item && renderListItem( index, item ) ) }</ul>
);

const renderMark = ( { markName }: TrademarkClaim ) => {
	return markName && renderItem( 'mark-name', __( 'Mark' ), markName );
};

const renderJurisdiction = ( { jurDesc }: TrademarkClaim ) => {
	return jurDesc && renderItem( 'jurisdiction', __( 'Jurisdiction' ), jurDesc );
};

const renderGoodsAndServices = ( { goodsAndServices }: TrademarkClaim ) => {
	return (
		goodsAndServices &&
		renderItem( 'goods-and-services', __( 'Goods and Services' ), renderList( goodsAndServices ) )
	);
};

const renderInternationalClassification = ( { classDesc }: TrademarkClaim ) => {
	return (
		classDesc &&
		renderItem(
			'international-classification',
			__( 'International Class of Goods and Services or Equivalent if applicable' ),
			renderList( classDesc )
		)
	);
};

const renderContactInfo = ( contact: TrademarkClaimContact ) => {
	if ( ! contact ) {
		return;
	}

	const addr = contact.addr;

	const contactData: ReactNode[] = [];
	contact.name && contactData.push( renderItem( 'name', __( 'Name' ), contact.name ) );
	contact.org && contactData.push( renderItem( 'org', __( 'Organization' ), contact.org ) );
	addr?.street?.forEach(
		( street, index ) =>
			street && contactData.push( renderItem( 'street' + index, __( 'Address' ), street ) )
	);
	addr?.city && contactData.push( renderItem( 'city', __( 'City' ), addr.city ) );
	addr?.sp && contactData.push( renderItem( 'sp', __( 'State' ), addr.sp ) );
	addr?.pc && contactData.push( renderItem( 'pc', __( 'Postal Code' ), addr.pc ) );
	addr?.cc && contactData.push( renderItem( 'cc', __( 'Country' ), addr.cc ) );
	contact.voice && contactData.push( renderItem( 'voice', __( 'Phone' ), contact.voice ) );
	contact.fax && contactData.push( renderItem( 'fax', __( 'Fax' ), contact.fax ) );
	contact.email && contactData.push( renderItem( 'email', __( 'Email' ), contact.email ) );

	return renderList( contactData );
};

const renderRegistrant = ( { holder }: TrademarkClaim ) => {
	return (
		holder && renderItem( 'holder', __( 'Trademark Registrant' ), renderContactInfo( holder ) )
	);
};

const renderContact = ( { contact }: TrademarkClaim ) => {
	return contact && renderItem( 'contact', __( 'Contact' ), renderContactInfo( contact ) );
};

const renderCourtCases = ( courtCases: TrademarkClaimCourtCase[] ) => {
	return courtCases.map( ( courtCase, index ) =>
		renderItem(
			index,
			null,
			renderList( [
				renderItem( 'ref-num', __( 'Reference Number' ), courtCase.refNum ),
				renderItem( 'cc', __( 'Jurisdiction' ), courtCase.cc ),
				renderItem( 'court-name', __( 'Court Name' ), courtCase.courtName ),
			] )
		)
	);
};

const renderUdrpCases = ( udrpCases: TrademarkClaimUdrpCase[] ) => {
	return udrpCases.map( ( udrpCase, index ) =>
		renderItem(
			index,
			null,
			renderList( [
				renderItem( 'case-no', __( 'Case Number' ), udrpCase.caseNo ),
				renderItem( 'udrp-provider', __( 'UDRP Provider' ), udrpCase.udrpProvider ),
			] )
		)
	);
};

const renderCases = ( { notExactMatch }: TrademarkClaim ) => {
	if ( ! notExactMatch ) {
		return;
	}

	const courtCases = notExactMatch?.court;
	const udrpCases = notExactMatch?.udrp;

	return (
		<div key="claim-cases">
			<p>{ TRADE_MARK_CLAIMS_MODAL_COPY.COURT_CASES }</p>

			{ courtCases && renderCourtCases( courtCases ) }
			{ udrpCases && renderUdrpCases( udrpCases ) }
		</div>
	);
};

export const TrademarkClaimsModalContent = ( {
	trademarkClaimsNoticeInfo,
}: {
	trademarkClaimsNoticeInfo: TrademarkClaimsNoticeInfo;
} ) => {
	const claims = Array.isArray( trademarkClaimsNoticeInfo.claim )
		? trademarkClaimsNoticeInfo.claim
		: [ trademarkClaimsNoticeInfo.claim ];

	return (
		<ol>
			{ claims.map( ( claim, index ) => (
				<li key={ index }>
					<div className="domain-search-trademark-claims-modal__content-claim-item">
						{ renderMark( claim ) }
						{ renderJurisdiction( claim ) }
						{ renderGoodsAndServices( claim ) }
						{ renderInternationalClassification( claim ) }
						{ renderRegistrant( claim ) }
						{ renderContact( claim ) }
						{ renderCases( claim ) }
					</div>
				</li>
			) ) }
		</ol>
	);
};
