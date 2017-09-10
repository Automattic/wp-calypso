/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Search from 'components/search';
import SelectDropdown from 'components/select-dropdown';
import { isFreeJetpackPlan, isPersonal } from 'lib/products-values';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

class DisconnectFollowUp extends Component {
	state = {
		reasonSelected: 'Backups',
	};

	logReasonFollowUp = option => {
		this.setState( {
			reasonSelected: option.value,
		} );
		// save data
	};

	setOptionsPaidPlan = () => {
		const { site } = this.props;

		let options = [];
		options = [
			{ value: 'Backups', label: 'Backups' },
			{ value: 'Antispam', label: 'Antispam' },
			{ value: 'Stats', label: 'Stats' },
			{ value: 'Publicize', label: 'Publicize' },
			{ value: 'Subscriptions', label: 'Subscriptions' },
			{ value: 'Other', label: 'Other' },
		];
		if ( ! isPersonal( site.plan ) ) {
			options.push( { value: 'Security Scanning', label: 'Security Scanning' } );
		}

		return options;
	};

	getFollowUpQuestion = optionValue => {
		const { site, translate } = this.props;

		let textShareWhat = '';

		switch ( optionValue ) {
			case 'tooHard':
				if ( isFreeJetpackPlan( site.plan ) ) {
					textShareWhat = translate( 'Can we help ? ' );
				} else {
					textShareWhat = translate( 'Which feature or service caused' + ' you problems?' );
				}
				break;

			case 'didNotInclude':
				textShareWhat = translate( 'Which feature where you looking for? ' );
				break;

			case 'onlyNeedFree':
				textShareWhat = translate( 'Would you like to downgrade your plan?' );
				break;
		}
		return textShareWhat;
	};

	redirectToDisconnect() {
		// placeholder for action
		// use redirect-to HoC
	}

	redirectToPlans() {
		// placeholder for action
		// use redirect-to HoC
	}

	renderFollowUp( optionValue ) {
		const { optionSelected, site, translate } = this.props;

		const noop = () => {};

		switch ( optionValue ) {
			case 'tooHard':
				if ( ! isFreeJetpackPlan( site.plan ) ) {
					const options = this.setOptionsPaidPlan( optionValue );
					return (
						<SelectDropdown
							onSelect={ this.logReasonFollowUp }
							options={ options }
							selectedText={ optionValue.value }
							initialSelected={ 'Backups' }
							optionSelected={ optionSelected }
						/>
					);
				}
				if ( isFreeJetpackPlan( site.plan ) ) {
					return (
						<h1>
							{ translate( 'Feel free to {{a}}get in touch{{/a}} with our Happiness Engineers.', {
								components: {
									a: (
										<a
											href="https://jetpack.com/contact-support/"
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							} ) }
						</h1>
					);
				}

			case 'didNotInclude':
				return (
					<Search
						onSearch={ noop }
						placeholder="What are you looking for?"
						inputLabel="What do you seek?"
					/>
				);
			// This will show only for Premium/Pro
			// to be shown only if there is a simple downgrade path available to customers
			case 'onlyNeedFree':
				return (
					<div className="disconnect-site__plan-degrade-buttons">
						<Button borderless icon onClick={ this.redirectToPlans }>
							<Gridicon icon="heart" />
							Yes, let's find a better fit
						</Button>
						<Button borderless onClick={ this.redirectToDisconnect }>
							<Gridicon icon="link-break" /> No, I'd like to disconnect
						</Button>
					</div>
				);
		}
	}

	render() {
		const { optionSelected } = this.props;
		return (
			<div>
				<div className="disconnect-site__question">
					{ this.getFollowUpQuestion( optionSelected ) }
				</div>

				<div className="disconnect-site__dropdown">
					{ this.renderFollowUp( optionSelected ) }
				</div>
			</div>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteIsJetpack: isJetpackSite( state, getSelectedSiteId( state ) ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( DisconnectFollowUp ) );
