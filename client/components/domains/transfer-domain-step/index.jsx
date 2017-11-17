/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, get, noop } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import { checkDomainAvailability, getFixedDomainSearch, getTld } from 'lib/domains';
import { domainAvailability } from 'lib/domains/constants';
import { getAvailabilityNotice } from 'lib/domains/registration/availability-messages';
import DomainRegistrationSuggestion from 'components/domains/domain-registration-suggestion';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	recordAddDomainButtonClickInMapDomain,
	recordFormSubmitInMapDomain,
	recordInputFocusInMapDomain,
	recordGoButtonClickInMapDomain,
} from 'state/domains/actions';
import Notice from 'components/notice';
import Card from 'components/card';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import TransferDomainPrecheck from './transfer-domain-precheck';
import support from 'lib/url/support';

class TransferDomainStep extends React.Component {
	static propTypes = {
		products: PropTypes.object.isRequired,
		cart: PropTypes.object,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
		initialQuery: PropTypes.string,
		analyticsSection: PropTypes.string.isRequired,
		domainsWithPlansOnly: PropTypes.bool.isRequired,
		onRegisterDomain: PropTypes.func.isRequired,
		onTransferDomain: PropTypes.func.isRequired,
		onSave: PropTypes.func,
	};

	static defaultProps = {
		onSave: noop,
		analyticsSection: 'domains',
	};

	state = this.getDefaultState();

	getDefaultState() {
		return {
			searchQuery: this.props.initialQuery || '',
			domain: null,
		};
	}

	componentWillMount() {
		if ( this.props.initialState ) {
			this.setState( Object.assign( {}, this.props.initialState, this.getDefaultState() ) );
		}
	}

	componentWillUnmount() {
		this.props.onSave( this.state );
	}

	notice() {
		if ( this.state.notice ) {
			return (
				<Notice
					text={ this.state.notice }
					status={ `is-${ this.state.noticeSeverity }` }
					showDismiss={ false }
				/>
			);
		}
	}

	getMapDomainUrl() {
		const { basePath, selectedSite } = this.props;
		let mapDomainUrl;

		const basePathForMapping = endsWith( basePath, '/transfer' )
			? basePath.substring( 0, basePath.length - 9 )
			: basePath;

		const query = qs.stringify( { initialQuery: this.state.searchQuery.trim() } );
		mapDomainUrl = `${ basePathForMapping }/mapping`;
		if ( selectedSite ) {
			mapDomainUrl += `/${ selectedSite.slug }?${ query }`;
		}

		return mapDomainUrl;
	}

	goToMapDomainStep = event => {
		event.preventDefault();

		this.props.recordMapDomainButtonClick( this.props.analyticsSection );

		page( this.getMapDomainUrl() );
	};

	addTransfer() {
		const cost = this.props.products.domain_map
			? this.props.products.domain_map.cost_display
			: null;
		const { translate } = this.props;

		return (
			<div>
				{ this.notice() }
				<form className="transfer-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="transfer-domain-step__domain-description">
						<div className="transfer-domain-step__domain-heading">
							{ translate( 'Manage your domain and site together on WordPress.com.' ) }
						</div>
						<div>
							{ translate(
								'Transfer your domain from your current provider to WordPress.com so ' +
									'you can manage your domain and site in the same place. {{a}}Learn More{{/a}}',
								{
									components: { a: <a href="#" /> },
								}
							) }
						</div>
					</div>

					<div className="transfer-domain-step__add-domain" role="group">
						<FormTextInputWithAffixes
							prefix="http://"
							type="text"
							value={ this.state.searchQuery }
							placeholder={ translate( 'example.com' ) }
							onBlur={ this.save }
							onChange={ this.setSearchQuery }
							onClick={ this.recordInputFocus }
							autoFocus
						/>
					</div>
					<button
						disabled={ this.state.searchQuery.length === 0 }
						className="transfer-domain-step__go button is-primary"
						onClick={ this.recordGoButtonClick }
					>
						{ translate( 'Transfer to WordPress.com' ) }
					</button>
					{ this.domainRegistrationUpsell() }
				</form>

				<Card className="transfer-domain-step__map-option">
					<strong>{ translate( 'Manage your domain and site separately.' ) }</strong>
					<p>
						{ translate(
							'Leave the domain at your current provider and {{a}}manually connect it{{/a}} to ' +
								'your WordPress.com site for %(cost)s.',
							{
								args: { cost },
								components: { a: <a href="#" onClick={ this.goToMapDomainStep } /> },
							}
						) }
						<a
							className="transfer-domain-step__map-help"
							href={ support.MAP_EXISTING_DOMAIN }
							rel="noopener noreferrer"
						>
							<Gridicon icon="help" size={ 18 } />
						</a>
					</p>
				</Card>
			</div>
		);
	}

	transferDomainPrecheck() {
		return (
			<TransferDomainPrecheck
				domain={ this.state.domain }
				setValid={ this.props.onTransferDomain }
			/>
		);
	}

	render() {
		let content;
		const { domain } = this.state;

		if ( domain ) {
			content = this.transferDomainPrecheck();
		} else {
			content = this.addTransfer();
		}

		return <div className="transfer-domain-step">{ content }</div>;
	}

	domainRegistrationUpsell() {
		const { suggestion } = this.state;
		if ( ! suggestion ) {
			return;
		}

		return (
			<div className={ 'transfer-domain-step__domain-availability' }>
				<Notice status="is-success" showDismiss={ false }>
					{ this.props.translate( '%(domain)s is available!', {
						args: { domain: suggestion.domain_name },
					} ) }
				</Notice>
				<DomainRegistrationSuggestion
					suggestion={ suggestion }
					selectedSite={ this.props.selectedSite }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					key={ suggestion.domain_name }
					cart={ this.props.cart }
					onButtonClick={ this.registerSuggestedDomain }
				/>
			</div>
		);
	}

	registerSuggestedDomain = () => {
		this.props.recordAddDomainButtonClickInMapDomain(
			this.state.suggestion.domain_name,
			this.props.analyticsSection
		);

		return this.props.onRegisterDomain( this.state.suggestion );
	};

	recordInputFocus = () => {
		this.props.recordInputFocusInMapDomain( this.state.searchQuery );
	};

	recordGoButtonClick = () => {
		this.props.recordGoButtonClickInMapDomain(
			this.state.searchQuery,
			this.props.analyticsSection
		);
	};

	setSearchQuery = event => {
		this.setState( { searchQuery: event.target.value } );
	};

	handleFormSubmit = event => {
		event.preventDefault();

		const domain = getFixedDomainSearch( this.state.searchQuery );
		this.props.recordFormSubmitInMapDomain( this.state.searchQuery );
		this.setState( { suggestion: null, notice: null } );

		checkDomainAvailability( domain, ( error, result ) => {
			const status = get( result, 'status', error );
			switch ( status ) {
				case domainAvailability.AVAILABLE:
					this.setState( { suggestion: result } );
					return;
				case domainAvailability.MAPPABLE:
				case domainAvailability.MAPPED:
				case domainAvailability.UNKNOWN:
					if ( get( result, 'transferrable', error ) === true ) {
						this.setState( { domain } );
						return;
					}

					const tld = getTld( domain );

					this.setState( {
						notice: this.props.translate(
							"We don't support transfers for domains ending with {{strong}}.%(tld)s{{/strong}}, " +
								'but you can {{a}}map it{{/a}} instead.',
							{
								args: { tld },
								components: {
									strong: <strong />,
									a: <a href="#" onClick={ this.goToMapDomainStep } />,
								},
							}
						),
						noticeSeverity: 'info',
					} );
					return;
				default:
					const { message, severity } = getAvailabilityNotice( domain, status );
					this.setState( { notice: message, noticeSeverity: severity } );
					return;
			}
		} );
	};
}

const recordMapDomainButtonClick = section =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Search', 'Clicked "Map it" Button' ),
		recordTracksEvent( 'calypso_domain_search_results_mapping_button_click', { section } )
	);

export default connect(
	state => ( {
		currentUser: getCurrentUser( state ),
		selectedSite: getSelectedSite( state ),
	} ),
	{
		recordAddDomainButtonClickInMapDomain,
		recordFormSubmitInMapDomain,
		recordInputFocusInMapDomain,
		recordGoButtonClickInMapDomain,
		recordMapDomainButtonClick,
	}
)( localize( TransferDomainStep ) );
