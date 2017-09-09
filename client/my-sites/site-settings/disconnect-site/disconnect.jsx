/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import DisconnectFollowUp from './disconnect-follow-up';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { isBusiness, isFreeJetpackPlan, isPremium } from 'lib/products-values';
import SelectDropdown from 'components/select-dropdown';

class Disconnect extends Component {
	state = {
		reasonSelected: 'tooHard',
		renderFull: false,
	};

	renderFull( option ) {
		return (
			<div>
				<DisconnectFollowUp optionSelected={ option } />
			</div>
		);
	}

	logReason = option => {
		this.setState( {
			reasonSelected: option.value,
			renderFull: true,
		} );
		// save the data
	};

	getOptions() {
		const { site } = this.props;

		const options = [ { value: 'didNotInclude', label: 'I could not find what I needed' } ];

		if ( isFreeJetpackPlan( site.plan ) ) {
			options.push( { value: 'tooHard', label: 'I experienced problems setting up Jetpack' } );
		} else {
			options.push( { value: 'tooHard', label: 'It was too hard to configure Jetpack' } );
		}
		if ( isPremium( site.plan ) || isBusiness( site.plan ) ) {
			options.push( { value: 'onlyNeedFree', label: 'This plan is too expensive' } );
		}

		return options;
	}

	renderCardContent() {
		const { translate, siteSlug } = this.props;

		const { reasonSelected, renderFull } = this.state;

		const textShareWhy = translate(
			'Would you mind sharing why you want to disconnect %(siteName)s from WordPress.com ',
			{
				textOnly: true,
				args: { siteName: siteSlug },
			}
		);

		const options = this.getOptions();

		return (
			<Card>
				<h1>
					{' '}
					{ translate( 'Disconnection' ) }{' '}
				</h1>
				<div className="disconnect-site__question">
					{ textShareWhy }
				</div>
				<SelectDropdown
					onSelect={ this.logReason }
					options={ options }
					initialSelected={ 'tooHard' }
				/>
				{ renderFull ? this.renderFull( reasonSelected ) : null }
			</Card>
		);
	}

	render() {
		return (
			<div>
				{ this.renderCardContent() }
			</div>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( Disconnect ) );
