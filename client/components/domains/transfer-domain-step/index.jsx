/**
 * External dependencies
 *
 * @format
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { endsWith, noop } from 'lodash';
import Gridicon from 'gridicons';
import page from 'page';
import qs from 'qs';

/**
 * Internal dependencies
 */
import { getFixedDomainSearch, checkDomainAvailability } from 'lib/domains';
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
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { getSelectedSite } from 'state/ui/selectors';

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

	render() {
		const cost = this.props.products.domain_map
			? this.props.products.domain_map.cost_display
			: null;
		const { translate } = this.props;

		return (
			<div className="transfer-domain-step">
				{ this.notice() }
				<form className="transfer-domain-step__form card" onSubmit={ this.handleFormSubmit }>
					<div className="transfer-domain-step__domain-description">
						<p>{ translate( 'Use your own domain for your WordPress.com site.' ) }</p>
						<p>
							{ translate(
								'Enter the domain you want to transfer to WordPress.com and manage your domain and site' +
									" all in one place. Domains purchased in the last 60 days can't be transferred. {{a}}Learn More{{/a}}",
								{
									components: { a: <a href="#" /> },
								}
							) }
						</p>
					</div>

					<div className="transfer-domain-step__add-domain" role="group">
						<input
							className="transfer-domain-step__external-domain"
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
						className="transfer-domain-step__go button is-primary"
						onClick={ this.recordGoButtonClick }
					>
						{ translate( 'Transfer to WordPress.com' ) }
					</button>
					{ this.domainRegistrationUpsell() }
					<div>
						<p>
							{ translate(
								"Don't want to transfer? You can {{a}}map it{{/a}} for %(cost)s instead.",
								{
									args: { cost },
									components: { a: <a href="#" onClick={ this.goToMapDomainStep } /> },
								}
							) }
							<Gridicon icon="help" size={ 24 } />
						</p>
					</div>
				</form>
			</div>
		);
	}

	domainRegistrationUpsell() {
		const { suggestion } = this.state;
		if ( ! suggestion ) {
			return;
		}

		return (
			<div
				className={ classnames(
					'domain-search-results__domain-availability',
					'is-mapping-suggestion'
				) }
			>
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
			const status = result && result.status ? result.status : error;
			switch ( status ) {
				case domainAvailability.MAPPABLE:
				case domainAvailability.UNKNOWN:
					this.props.onTransferDomain( domain );
					return;

				case domainAvailability.AVAILABLE:
					this.setState( { suggestion: result } );
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
