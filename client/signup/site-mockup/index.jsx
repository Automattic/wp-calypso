/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import SiteMockup from './site-mockup';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { getVerticalData } from './mock-data';

/**
 * Style dependencies
 */
import './style.scss';

class SiteMockups extends Component {
	getTagline() {
		const { siteInformation } = this.props;
		if ( isEmpty( siteInformation ) ) {
			return translate( 'You’ll be able to customize this to your needs.' );
		}
		return (
			<>
				{ siteInformation.address && (
					<span className="site-mockup__address">
						{ this.formatAddress( siteInformation.address ) }
					</span>
				) }
				{ siteInformation.phone && (
					<span className="site-mockup__phone">{ siteInformation.phone }</span>
				) }
			</>
		);
	}

	/**
	 *
	 * @param {string} address An address formatted onto separate lines
	 * @return {string} Get rid of the last line of the address.
	 */
	formatAddress( address ) {
		const parts = address.split( '\n' );
		return parts.slice( 0, 2 ).join( ', ' );
	}

	shouldRender() {
		// currently only showing on business site types
		return this.props.siteType === 'business';
	}

	render() {
		if ( ! this.shouldRender() ) {
			return null;
		}
		const siteMockupClasses = classNames( {
			'site-mockup__wrap': true,
		} );
		const otherProps = {
			title: this.props.title,
			tagline: this.getTagline(),
			data: this.props.verticalData,
		};

		return (
			<div className={ siteMockupClasses }>
				<SiteMockup size="desktop" { ...otherProps } />
				<SiteMockup size="mobile" { ...otherProps } />
			</div>
		);
	}
}

export default connect( state => {
	const vertical = getSignupStepsSiteTopic( state );
	return {
		title: getSiteTitle( state ) || translate( 'Your New Website' ),
		siteInformation: getSiteInformation( state ),
		siteType: getSiteType( state ),
		vertical,
		verticalData: getVerticalData( vertical ),
	};
} )( SiteMockups );
