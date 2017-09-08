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
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { isFreeJetpackPlan } from 'lib/products-values';
import SelectDropdown from 'components/select-dropdown';

class Disconnect extends Component {
	state = {
		reasonSelected: 'tooHard',
		compactButtons: false,
		renderFull: false,
	};

	renderFull() {
		// placeholder
		return (
			<div>
				{ ' follow-up QA' }
			</div>
		);
	}

	logReason = option => {
		this.setState( {
			reasonSelected: option.value,
			renderFull: true,
		} );
	};

	getOptions() {
		const { site } = this.props;

		const options = [
			{ value: 'tooHard', label: 'It was too hard to configure Jetpack' },
			{ value: 'didNotInclude', label: 'This plan didn’t include what I needed' },
		];

		if ( ! isFreeJetpackPlan( site.plan ) ) {
			options.push( { value: 'onlyNeedFree', label: 'This plan is too expensive' } );
		}
		return options;
	}

	renderCardContent() {
		const { translate, siteSlug } = this.props;

		const { reasonSelected, compactButtons, renderFull } = this.state;

		const textShareWhy =
			translate( ' Would you mind sharing why you want to disconnect ' ) +
			`${ siteSlug }` +
			translate( ' from WordPress.com ' );

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
					compact={ compactButtons }
					onSelect={ this.logReason }
					options={ options }
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
